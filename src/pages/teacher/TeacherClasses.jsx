import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar, List, ListItem,
  ListItemAvatar, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions,
  Paper, Divider
} from '@mui/material';
import { Class as ClassIcon, People as PeopleIcon, Schedule as ScheduleIcon, Visibility as VisibilityIcon, Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getTeacherByUserId, getClassesForTeacher } from '../../services/supabase/teachers';
import ClassDetailDialog from '../../components/common/ClassDetailDialog';

function TeacherClasses() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const { data: teacherRow } = await getTeacherByUserId(user.id);
        if (teacherRow?.id) {
          const { data: tClasses } = await getClassesForTeacher(teacherRow.id, { includeStudents: true });
          console.log('[TeacherClasses] fetched classes', tClasses?.length, tClasses);
          setClasses(tClasses || []);
        } else {
          setClasses([]);
        }
      } finally { setLoading(false); }
    };
    load();
  }, [user?.id]);

  const openDialog = (cls) => { setSelectedClass(cls); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setSelectedClass(null); };

  const subjectOptions = useMemo(() => {
    const set = new Set();
    classes.forEach(c => { if (c.subject?.name) set.add(c.subject.name); });
    return Array.from(set);
  }, [classes]);

  const filtered = useMemo(() => {
    return classes.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (subjectFilter !== 'all' && c.subject?.name !== subjectFilter) return false;
      return true;
    });
  }, [classes, search, subjectFilter]);

  const ClassCard = ({ classItem }) => (
    <Card elevation={0} onClick={() => openDialog(classItem)} sx={{ cursor:'pointer', background:'rgba(255,255,255,0.9)', backdropFilter:'blur(20px)', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.3)', height:'100%', transition:'all .3s', '&:hover':{ transform:'translateY(-4px)', boxShadow:'0 8px 24px rgba(0,0,0,0.12)' } }}>
      <CardContent sx={{ p:3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar sx={{ bgcolor:'primary.light', width:56, height:56 }}><ClassIcon /></Avatar>
          {classItem.subject?.name && <Chip label={classItem.subject.name} color="primary" variant="outlined" />}
        </Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom>{classItem.name}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom noWrap>{classItem.description || 'Không có mô tả'}</Typography>
        <Box mt={1} mb={1}>
          <Box display="flex" alignItems="center" mb={0.5}><PeopleIcon sx={{ mr:1, fontSize:18, color:'text.secondary' }} /><Typography variant="caption">{(classItem.students_list||[]).length} HS</Typography></Box>
          {/* {classItem.schedule_list && classItem.schedule_list.length > 0 && (() => {
            const first = classItem.schedule_list[0];
            const st = first.start_time?.slice(0,5) || '--:--';
            const et = first.end_time?.slice(0,5) || '--:--';
            return (
              <Box display="flex" alignItems="center" mb={0.5}>
                <ScheduleIcon sx={{ mr:1, fontSize:18, color:'text.secondary' }} />
                <Typography variant="caption">Thứ {first.day_of_week} {st}-{et}{first.location ? ` • ${first.location}`:''}</Typography>
              </Box>
            );
          })()} */}
        </Box>
        <Button fullWidth variant="outlined" size="small" startIcon={<VisibilityIcon />} onClick={(e)=>{ e.stopPropagation(); openDialog(classItem); }} sx={{ borderRadius:2, textTransform:'none', fontWeight:600 }}>Chi tiết</Button>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>Lớp học 📚</Typography>
        <Typography variant="h6">{loading ? 'Đang tải danh sách lớp...' : `Quản lý ${classes.length} lớp học được phân công`}</Typography>
      </Box>
      <Paper sx={{ p:2, mb:3, borderRadius:3, background:'rgba(255,255,255,0.9)', backdropFilter:'blur(16px)' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={4}>
            <Box display="flex" alignItems="center" gap={1}>
              <SearchIcon fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600}>Tìm kiếm</Typography>
            </Box>
            <Box mt={1}>
              <input
                style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:'1px solid #ccc', outline:'none', background:'rgba(255,255,255,0.6)' }}
                placeholder="Tên lớp..."
                value={search}
                onChange={e=>setSearch(e.target.value)}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <Typography variant="subtitle2" fontWeight={600}>Môn học</Typography>
            <Box mt={1}>
              <select
                value={subjectFilter}
                onChange={e=>setSubjectFilter(e.target.value)}
                style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:'1px solid #ccc', background:'rgba(255,255,255,0.6)' }}
              >
                <option value="all">Tất cả</option>
                {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {filtered.map(cls => (
          <Grid item xs={12} md={6} lg={4} key={cls.id}><ClassCard classItem={cls} /></Grid>
        ))}
        {!loading && !filtered.length && (
          <Grid item xs={12}><Paper sx={{ p:3, textAlign:'center' }}>Không có lớp phù hợp.</Paper></Grid>
        )}
      </Grid>

  <ClassDetailDialog open={dialogOpen} onClose={closeDialog} classItem={selectedClass} />
    </Box>
  );
}

export default TeacherClasses;
