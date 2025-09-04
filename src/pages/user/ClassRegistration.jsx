import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  Event as EventIcon,
  MonetizationOn as MonetizationOnIcon,
  School as SchoolIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';
import { Person as PersonIcon } from '@mui/icons-material';
import { Tabs, Tab } from '@mui/material';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import dayjs from 'dayjs';

import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  getOpenClasses,
  enrollClass,
  getStudentByUserId,
  getEnrollments,
  getClassTeachers,
  getClassById
} from '../../services/supabase/database';
// (Removed subjects_grades filter; we'll filter by subject only)
// Lấy lịch học nhiều lớp
import { getSchedulesForClasses, getSubjectsGradesByIds } from '../../services/supabase/classes';

function ClassRegistration() {
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  
  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [schedulesMap, setSchedulesMap] = useState({}); // { classId: [schedules] }
  const [tabValue, setTabValue] = useState(0); // 0=Môn của tôi, 1=Đăng ký
  const [conflicts, setConflicts] = useState([]); // lưu danh sách trùng lịch khi chọn đăng ký
  const [selectedClassTeachers, setSelectedClassTeachers] = useState([]);
  const [myStatusFilter, setMyStatusFilter] = useState('active'); // active | ended | all
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailClass, setDetailClass] = useState(null);
  const [detailTeachers, setDetailTeachers] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [subjectOptions, setSubjectOptions] = useState([]); // unique subject names
  const [teachersMap, setTeachersMap] = useState({});

  // Deduplicate classes by id
  const dedupeClasses = (list) => {
    const map = new Map();
    list.forEach(c => { if (c && c.id != null && !map.has(c.id)) map.set(c.id, c); });
    return Array.from(map.values());
  };

  const extractSubjectName = (cls) => cls?.subjects_grades?.subject?.name || cls?.subject?.name || '';
  const extractGrade = (cls) => cls?.subjects_grades?.grade_id || cls?.grade || null;
  const extractCombination = (cls) => cls?.subjects_grades?.name || (
    extractSubjectName(cls) && extractGrade(cls)
      ? `${extractSubjectName(cls)} - Lớp ${extractGrade(cls)}`
      : extractSubjectName(cls) || 'Không xác định'
  );
  
  useEffect(() => {
    if (user) {
      fetchStudentData();
      fetchClasses();
    }
  }, [user]);

  // Prefetch teachers for visible classes (lazy, avoid duplicates)
  useEffect(() => {
    const ids = classes.map(c=>c.id).filter(Boolean);
    const toFetch = ids.filter(id => !teachersMap[id]);
    if (!toFetch.length) return;
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(toFetch.map(async id => {
        try { const { data } = await getClassTeachers(id); return { id, data: data||[] }; } catch { return { id, data: [] }; }
      }));
      if (cancelled) return;
      setTeachersMap(prev => {
        const next = { ...prev };
        results.forEach(r => { if (r.status==='fulfilled') next[r.value.id] = r.value.data; });
        return next;
      });
    })();
    return () => { cancelled = true; };
  }, [classes, teachersMap]);

  // Merge classes from enrollments (may include inactive or non-public) into classes list
  useEffect(() => {
    const mergeEnrollmentClasses = async () => {
      if (!enrollments.length) return;
      const enrollmentClassesRaw = enrollments.map(e => e.classes).filter(Boolean);
      if (!enrollmentClassesRaw.length) return;
      const existingIds = new Set(classes.map(c => c.id));
      // Filter out already existing ids and then dedupe among themselves
      const seen = new Set();
      const toAdd = enrollmentClassesRaw.filter(c => {
        if (!c || existingIds.has(c.id) || seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
      if (!toAdd.length) return;
      // Enrich new classes with subjects_grades + subject if missing
      const enriched = await Promise.all(toAdd.map(async c => {
        if (!c.subjects_grades && (c.subjects_grades_id || c.subject_id)) {
          try {
            const { data } = await getClassById(c.id);
            if (data) return data;
          } catch (_) { /* ignore */ }
        }
        return c;
      }));
  setClasses(prev => dedupeClasses([...prev, ...enriched]));
    };
    mergeEnrollmentClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollments]);

  // Rebuild subject options whenever classes change, with fallback enrichment if subject missing
  useEffect(() => {
    const buildOptions = async () => {
      if (!classes.length) { setSubjectOptions([]); return; }
      // Identify classes missing subject name but having subjects_grades_id
      const missing = classes.filter(c => !extractSubjectName(c) && c.subjects_grades_id);
      let enrichedMap = {};
      if (missing.length) {
        const uniqueIds = Array.from(new Set(missing.map(m => m.subjects_grades_id))); 
        try {
          const { data } = await getSubjectsGradesByIds(uniqueIds);
          data.forEach(row => { enrichedMap[row.id] = row; });
        } catch (_) {}
      }
      const subjectNames = classes.map(c => {
        let name = extractSubjectName(c);
        if (!name && c.subjects_grades_id && enrichedMap[c.subjects_grades_id]) {
          name = enrichedMap[c.subjects_grades_id].subject?.name || '';
        }
        return name;
      }).filter(Boolean);
      const uniqueSubjects = Array.from(new Set(subjectNames));
      setSubjectOptions(uniqueSubjects.map(s => ({ value: s, label: s })).sort((a,b)=>a.label.localeCompare(b.label,'vi')));
    };
    buildOptions();
  }, [classes]);
  
    useEffect(() => {
      const activeEnrollmentClassIds = enrollments.filter(e => e.status === 'active').map(e => e.class_id);
      let base = [];
      if (tabValue === 1) {
        // Tab Đăng ký (index 1): chỉ lớp chưa đăng ký và công khai
        base = classes.filter(c => !activeEnrollmentClassIds.includes(c.id) && ((c.isPublic ?? c.is_public) === true));
      } else {
        // Tab Môn của tôi (index 0): tất cả lớp đã đăng ký (kể cả đã kết thúc) rồi áp dụng bộ lọc trạng thái
        base = classes.filter(c => activeEnrollmentClassIds.includes(c.id));
        if (myStatusFilter === 'active') {
          base = base.filter(c => c.is_active === true);
        } else if (myStatusFilter === 'ended') {
          base = base.filter(c => c.is_active === false);
        } // 'all' giữ nguyên
      }
      // Apply subject filter if chosen
      if (subjectFilter !== 'all') {
        base = base.filter(c => extractSubjectName(c).toLowerCase() === subjectFilter.toLowerCase());
      }
      const lower = searchTerm.trim().toLowerCase();
      if (lower === '') {
        setFilteredClasses(base);
      } else {
        setFilteredClasses(base.filter(c =>
          c.name.toLowerCase().includes(lower) ||
          (c.subject?.name || '').toLowerCase().includes(lower) ||
          (c.level || '').toLowerCase().includes(lower)
        ));
      }
    }, [searchTerm, classes, enrollments, tabValue, myStatusFilter, subjectFilter]);

const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Lấy thông tin học sinh
      const { data, error } = await getStudentByUserId(user.id);
      if (error) throw error;
      // Nếu không có data, coi như học sinh chưa được tạo và không báo lỗi
      setStudent(data || null);
      
      // Chỉ lấy danh sách lớp nếu có thông tin học sinh
      if (data?.user_id) {
        const { data: enrollmentData, error: enrollmentError } = await getEnrollments(null, data.user_id);
        if (enrollmentError) throw enrollmentError;
        
        setEnrollments(enrollmentData || []);
      } else {
        setEnrollments([]);
      }
      
    } catch (error) {
      console.error('Error fetching student data:', error);
      // Có thể bỏ qua không hiển thị thông báo lỗi nếu muốn
      // showNotification('Lỗi khi tải thông tin học sinh: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await getOpenClasses();
      if (error) throw error;
      
      // Nếu không có lớp nào, set thành mảng rỗng
      const classesData = data || [];
  const unique = dedupeClasses(classesData);
  setClasses(unique);
  setFilteredClasses(unique);
  // subject options will be built by classes effect
      // Sau khi có danh sách lớp, tải lịch học
      const ids = classesData.map(c => c.id).filter(Boolean);
      if (ids.length) {
        try {
          const { data: schedules, error: schedErr } = await getSchedulesForClasses(ids);
          if (!schedErr && Array.isArray(schedules)) {
            const map = {};
            schedules.forEach(s => {
              if (!map[s.class_id]) map[s.class_id] = [];
              map[s.class_id].push(s);
            });
            // Sort mỗi lớp theo day_of_week rồi start_time
            Object.keys(map).forEach(k => {
              map[k].sort((a,b) => {
                const da = parseInt(a.day_of_week,10); const db = parseInt(b.day_of_week,10);
                if (da !== db) return da - db;
                return (a.start_time||'').localeCompare(b.start_time||'');
              });
            });
            setSchedulesMap(map);
          }
        } catch (inner) {
          console.warn('Không tải được lịch học:', inner);
        }
      } else {
        setSchedulesMap({});
      }
      
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Có thể bỏ qua không hiển thị thông báo lỗi nếu muốn
      // showNotification('Lỗi khi tải danh sách lớp học: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmDialog = async (classItem) => {
    setSelectedClass(classItem);
    // Lấy giáo viên của lớp
    try {
      const { data: teachersData } = await getClassTeachers(classItem.id);
      setSelectedClassTeachers(teachersData || []);
    } catch (e) {
      setSelectedClassTeachers([]);
    }
    // Tính toán xung đột lịch giữa lớpItem và các lớp đang học
    detectConflicts(classItem.id);
    setConfirmDialog(true);
  };

  const openDetail = async (cls) => {
    setDetailClass(cls);
    // fetch teachers for detail dialog
    try {
      const { data: teachersData } = await getClassTeachers(cls.id);
      setDetailTeachers(teachersData || []);
    } catch (_) {
      setDetailTeachers([]);
    }
    setDetailDialogOpen(true);
  };
  const closeDetail = () => { setDetailDialogOpen(false); setDetailClass(null); };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog(false);
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialog(false);
  };

  const isAlreadyEnrolled = (classId) => {
    return enrollments.some(e => e.class_id === classId && e.status === 'active');
  };

  const handleEnrollClass = async () => {
    if (!student || !selectedClass) return;
    setLoading(true);
    try {
      const enrollmentData = {
        student_id: student.user_id,
        class_id: selectedClass.id,
        enrolled_at: new Date().toISOString(),
        status: 'active'
      };
      const { error } = await enrollClass(enrollmentData);
      if (error) throw error;
      showNotification('Đăng ký lớp học thành công', 'success');
      fetchStudentData();
      handleCloseConfirmDialog();
      setSuccessDialog(true);
  setTabValue(0); // chuyển về tab "Môn của tôi" sau khi đăng ký
    } catch (error) {
      console.error('Error enrolling class:', error);
      showNotification('Lỗi khi đăng ký lớp học: ' + error.message, 'error');
      handleCloseConfirmDialog();
    } finally {
      setLoading(false);
    }
  };

  // Helper: safely format date range or show fallback if invalid/missing
  const dayNames = {
    '1': 'Thứ 2','2': 'Thứ 3','3': 'Thứ 4','4': 'Thứ 5','5': 'Thứ 6','6': 'Thứ 7','0': 'CN'
  };
  // Trả về mảng từng dòng lịch học: "Thứ X HH:MM-HH:MM (Phòng ...)"
  const getScheduleLines = (classId) => {
    const list = schedulesMap[classId] || [];
    if (!list.length) return [];
    // Sắp xếp trước
    const sorted = [...list].sort((a,b)=>{
      const da = parseInt(a.day_of_week,10); const db = parseInt(b.day_of_week,10);
      if (da !== db) {
        if (da===0) return 1; // CN cuối
        if (db===0) return -1;
        return da - db;
      }
      return (a.start_time||'').localeCompare(b.start_time||'');
    });
    return sorted.map(s => {
      const dn = dayNames[String(s.day_of_week)] || s.day_of_week;
      const time = `${(s.start_time||'').slice(0,5)}-${(s.end_time||'').slice(0,5)}`;
      const room = s.location ? ` (${s.location})` : '';
      return `${dn} ${time}${room}`;
    });
  };

  // Giữ hàm cũ để tương thích nơi khác nếu cần (đã chuyển confirm dialog sang dùng getScheduleLines)
  const buildScheduleSummary = (classId) => {
    const lines = getScheduleLines(classId);
    return lines.length ? lines.join('|') : 'Chưa cập nhật';
  };
  
  // Tạo key cho so sánh khoảng thời gian: chuyển về phút
  const parseTime = (t) => {
    if (!t) return null; // t dạng HH:MM:SS hoặc HH:MM
    const parts = t.split(':');
    const h = parseInt(parts[0],10); const m = parseInt(parts[1],10);
    if (isNaN(h) || isNaN(m)) return null;
    return h*60 + m;
  };

  const detectConflicts = (targetClassId) => {
    if (!student) { setConflicts([]); return; }
    // lấy các lớp active mà học sinh đang học
    const activeClassIds = enrollments.filter(e => e.status === 'active').map(e => e.class_id);
    const targetSchedules = schedulesMap[targetClassId] || [];
    const result = [];
    if (!targetSchedules.length || !activeClassIds.length) { setConflicts([]); return; }
    activeClassIds.forEach(cid => {
      if (cid === targetClassId) return; // bỏ qua chính nó
      const otherSchedules = schedulesMap[cid] || [];
      targetSchedules.forEach(ts => {
        otherSchedules.forEach(os => {
          if (String(ts.day_of_week) === String(os.day_of_week)) {
            const tsStart = parseTime(ts.start_time); const tsEnd = parseTime(ts.end_time);
            const osStart = parseTime(os.start_time); const osEnd = parseTime(os.end_time);
            if (tsStart!=null && tsEnd!=null && osStart!=null && osEnd!=null) {
              const overlap = tsStart < osEnd && osStart < tsEnd; // khoảng thời gian chồng lấn
              if (overlap) {
                result.push({
                  class_id: cid,
                  target_schedule: ts,
                  other_schedule: os
                });
              }
            }
          }
        });
      });
    });
    setConflicts(result);
  };
                  {/* Lịch học sẽ được dựng từ schedulesMap */}

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Môn Học
      </Typography>
      <Box sx={{ borderBottom:1, borderColor:'divider', mb:2 }}>
        <Tabs value={tabValue} onChange={(e,v)=>setTabValue(v)}>
          <Tab label="Môn của tôi" />
          <Tab label="Đăng ký" />
        </Tabs>
      </Box>
  {tabValue === 0 && (
        <Box sx={{ mb:2, display:'flex', justifyContent:'flex-end' }}>
          <ToggleButtonGroup
            size="small"
            value={myStatusFilter}
            exclusive
            onChange={(e, val) => { if (val) setMyStatusFilter(val); }}
            aria-label="Lọc trạng thái lớp"
          >
            <ToggleButton value="active" aria-label="Đang hoạt động">Đang hoạt động</ToggleButton>
            <ToggleButton value="ended" aria-label="Đã kết thúc">Đã kết thúc</ToggleButton>
            <ToggleButton value="all" aria-label="Tất cả">Tất cả</ToggleButton>
          </ToggleButtonGroup>
        </Box>
  )}
      <Box sx={{ mb:2, display:'flex', gap:2, flexWrap:'wrap' }}>
        <Box sx={{ minWidth:200 }}>
          <Typography variant="caption" sx={{ display:'block', mb:0.5 }}>Lọc theo môn</Typography>
          <select
            value={subjectFilter}
            onChange={e=>setSubjectFilter(e.target.value)}
            style={{ width:'100%', padding:'6px 8px', borderRadius:6, border:'1px solid #ccc', background:'#fff' }}
          >
            <option value="all">Tất cả môn</option>
            {subjectOptions.length===0 && <option disabled>(Không có môn)</option>}
            {subjectOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </Box>
      </Box>
      
  <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm lớp học theo tên"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>
  {/* Tabs block already rendered above */}
      
    {!student ? (
        <Alert severity="warning">
          <AlertTitle>Thông báo</AlertTitle>
          Không tìm thấy thông tin học sinh. Vui lòng liên hệ với quản trị viên để được hỗ trợ.
        </Alert>
      ) : filteredClasses.length === 0 ? (
        <Alert severity="info">
          <AlertTitle>Thông báo</AlertTitle>
  {tabValue === 1 ? 'Không có môn công khai nào để đăng ký.' : 'Bạn chưa có môn học nào.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredClasses.map((classItem) => {
            const isEnrolled = isAlreadyEnrolled(classItem.id);
            const isFull = (classItem.max_students && classItem.current_students >= classItem.max_students);
            return (
              <Grid item xs={12} sm={6} md={4} key={classItem.id}>
                <Card sx={{ height:'100%', display:'flex', flexDirection:'column', position:'relative', backgroundColor:'#fff' }}>
                  {tabValue === 1 && isEnrolled && (
                    <Chip
                      label="Đã đăng ký"
                      variant="outlined"
                      color="success"
                      icon={<CheckIcon />}
                      sx={{ position:'absolute', top:12, right:12, zIndex:1, bgcolor:'rgba(255,255,255,0.6)', backdropFilter:'blur(4px)' }}
                    />
                  )}
                  <CardHeader
                    titleTypographyProps={{ variant:'h6', fontWeight:600 }}
                    title={classItem.name}
                    subheaderTypographyProps={{ variant:'body2' }}
                    subheader={extractCombination(classItem)}
                    action={
                      <Box display='flex' gap={1}>
                        {tabValue === 1 ? (
                          <>
                            {(classItem.isPublic ?? classItem.is_public) && <Chip size='small' label='Công khai' color='success' variant='outlined' />}
                            {classItem.is_active===false && <Chip size='small' label='Tạm dừng' color='warning' variant='outlined' />}
                          </>
                        ) : (
                          <Chip
                            size='small'
                            label={classItem.is_active ? 'Đã đăng ký' : 'Đã kết thúc'}
                            color={classItem.is_active ? 'success' : 'default'}
                            variant='outlined'
                          />
                        )}
                      </Box>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ flexGrow:1, px:2, py:1 }}>
                    <Box display='flex' alignItems='center' mb={1}>
                      <CalendarMonthIcon color='primary' sx={{ mr:1 }} />
                      <Typography variant='body2'>Lịch học: {buildScheduleSummary(classItem.id)}</Typography>
                    </Box>
                    <Box display='flex' alignItems='center' mb={1}>
                      <PersonIcon color='primary' sx={{ mr:1 }} />
                      <Typography variant='body2'>Giáo viên: {teachersMap?.[classItem.id]?.length ? teachersMap[classItem.id].map(t=>t.full_name).filter(Boolean).join(', ') : 'Chưa cập nhật'}</Typography>
                    </Box>
                    {classItem.description && (
                      <Typography variant='body2' color='text.secondary'>
                        {classItem.description.length > 100 ? `${classItem.description.substring(0,100)}...` : classItem.description}
                      </Typography>
                    )}
                    <Box mt={2} display='flex' justifyContent='space-between' alignItems='center'>
                    </Box>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button size='small' onClick={()=>openDetail(classItem)} startIcon={<InfoIcon />}>Chi tiết</Button>
                    {tabValue === 1 && (
                      <Button size='small' color='primary' variant='contained' disabled={isEnrolled || isFull} onClick={() => handleOpenConfirmDialog(classItem)} sx={{ ml:'auto' }}>
                        {isEnrolled ? 'Đã đăng ký' : isFull ? 'Lớp đã đầy' : 'Đăng ký'}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      {/* Dialog xác nhận đăng ký */}
      <Dialog open={confirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Xác nhận đăng ký lớp học</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn đăng ký lớp <strong>{selectedClass?.name}</strong>?
          </DialogContentText>
          
          {selectedClass && (
            <Box mt={2}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">Lớp học</TableCell>
                      <TableCell>{selectedClass.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Môn học</TableCell>
                      <TableCell>{extractSubjectName(selectedClass) || 'Không xác định'}</TableCell>
                    </TableRow>
                      {selectedClass.description && (
                        <TableRow>
                          <TableCell component="th" scope="row">Mô tả</TableCell>
                          <TableCell>{selectedClass.description}</TableCell>
                          {console.log(selectedClass)}
                        </TableRow>
                      )}
                    <TableRow>
                      <TableCell component="th" scope="row">Học phí</TableCell>
                      <TableCell>{selectedClass.fee.toLocaleString('vi-VN')} VNĐ</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Lịch học</TableCell>
                      <TableCell>
                        {(() => {
                          const lines = getScheduleLines(selectedClass.id);
                          return lines.length ? lines.map((l,i)=>(<div key={i}>{l}</div>)) : 'Chưa cập nhật';
                        })()}
                      </TableCell>
                    </TableRow>
                      {selectedClassTeachers.length > 0 && (
                        <TableRow>
                          <TableCell component="th" scope="row">Giáo viên</TableCell>
                          <TableCell>
                            {selectedClassTeachers.map(t => t.full_name).join(', ')}
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
            {conflicts.length > 0 && (
              <Alert severity="warning" sx={{ mt:2 }}>
                <AlertTitle>Cảnh báo trùng lịch</AlertTitle>
                Bạn đang có {conflicts.length} xung đột với các lớp đã đăng ký:
                <ul style={{ paddingLeft: '20px', marginTop: 4 }}>
                  {conflicts.slice(0,5).map((c,i) => {
                    const other = classes.find(cl=>cl.id===c.class_id);
                    const dayLabel = dayNames[String(c.target_schedule.day_of_week)] || c.target_schedule.day_of_week;
                    return <li key={i}>{other?.name || 'Lớp'} ({dayLabel} {c.target_schedule.start_time?.slice(0,5)}-{c.target_schedule.end_time?.slice(0,5)} trùng với {c.other_schedule.start_time?.slice(0,5)}-{c.other_schedule.end_time?.slice(0,5)})</li>;
                  })}
                  {conflicts.length > 5 && <li>... và {conflicts.length - 5} xung đột khác</li>}
                </ul>
                Bạn vẫn có thể đăng ký nhưng nên cân nhắc điều chỉnh.
              </Alert>
            )}
            {conflicts.length === 0 && selectedClass && (
              <Alert severity="success" sx={{ mt:2 }}>
                Không phát hiện xung đột lịch với các lớp hiện tại của bạn.
              </Alert>
            )}
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Sau khi đăng ký, bạn cần thanh toán học phí để hoàn tất quá trình. Liên hệ với trung tâm để biết thêm chi tiết.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Hủy</Button>
          <Button onClick={handleEnrollClass} variant="contained" color="primary">
            Xác nhận đăng ký
          </Button>
        </DialogActions>
      </Dialog>
      
  {/* Dialog đăng ký thành công */}
      <Dialog open={successDialog} onClose={handleCloseSuccessDialog}>
        <DialogTitle>Đăng ký thành công</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" my={2}>
            <CheckIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Bạn đã đăng ký lớp học thành công!
            </Typography>
            <Typography variant="body1" align="center">
              Vui lòng liên hệ với trung tâm để thanh toán học phí và nhận tài liệu học tập.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog}>Đóng</Button>
          <Button href="/user" variant="contained" color="primary">
            Về trang chủ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chi tiết lớp */}
      <Dialog open={detailDialogOpen} onClose={closeDetail} maxWidth='sm' fullWidth>
        <DialogTitle>Chi tiết lớp học</DialogTitle>
        <DialogContent dividers>
          {detailClass && (
            <Table size='small'>
              <TableBody>
                <TableRow><TableCell>Tên lớp</TableCell><TableCell>{detailClass.name}</TableCell></TableRow>
                <TableRow><TableCell>Giáo viên giảng dạy</TableCell><TableCell>{detailTeachers.length ? detailTeachers.map(t=>t.full_name).filter(Boolean).join(', ') : 'Chưa cập nhật'}</TableCell></TableRow>
                <TableRow><TableCell>Lịch học</TableCell><TableCell>
                  {(() => {
                    const lines = getScheduleLines(detailClass.id);
                    return lines.length ? lines.map((l,i)=>(<div key={i}>{l}</div>)) : 'Chưa cập nhật';
                  })()}
                </TableCell></TableRow>
                <TableRow><TableCell>Học phí</TableCell><TableCell>{detailClass.fee?.toLocaleString('vi-VN')} VNĐ</TableCell></TableRow>
                {detailClass.description && <TableRow><TableCell>Mô tả</TableCell><TableCell>{detailClass.description}</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail}>Đóng</Button>
          {detailClass && tabValue===1 && !isAlreadyEnrolled(detailClass.id) && (
            <Button variant='contained' onClick={()=>{ closeDetail(); handleOpenConfirmDialog(detailClass); }}>Đăng ký</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ClassRegistration;
