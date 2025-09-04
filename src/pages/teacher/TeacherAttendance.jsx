import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar, List, ListItem, ListItemAvatar, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, Paper, Divider, FormControl, InputLabel, Select, MenuItem,
  Checkbox, FormControlLabel, TextField, Alert, CircularProgress, IconButton
} from '@mui/material';
import {
  EventNote as EventNoteIcon, Class as ClassIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
  Save as SaveIcon, QrCodeScanner as QrCodeScannerIcon, Close as CloseIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import { getClassEnrollments, getAttendanceByDate, markAttendance, updateAttendance } from '../../services/supabase/database';
import { getTeacherByUserId, getClassesForTeacher } from '../../services/supabase/teachers';

function TeacherAttendance() {
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const { showNotification } = useNotification();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceDialog, setAttendanceDialog] = useState(false);
  const [qrDialog, setQrDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [scannedStudentId, setScannedStudentId] = useState(null);
  const qrRef = useRef(null);
  const [scanner, setScanner] = useState(null);

  useEffect(() => { fetchClasses(); }, []);
  useEffect(() => { if (selectedClass) fetchAttendance(); }, [selectedClass, selectedDate]);
  useEffect(() => () => { if (scanner) scanner.clear(); }, [scanner]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      if (!user?.id) return;
  const { data: teacherRow } = await getTeacherByUserId(user.id);
  if (!teacherRow?.id) { setClasses([]); setSelectedClass(null); return; }
  const { data: tClasses } = await getClassesForTeacher(teacherRow.id, { includeStudents: false });
      const active = (tClasses || []).filter(c => c.is_active);
      setClasses(active);
      setSelectedClass(active[0] || null);
    } catch (e) {
      showNotification('Lỗi tải lớp: ' + e.message, 'error');
    } finally { setLoading(false); }
  };

  const fetchAttendance = async () => {
    if (!selectedClass?.id) return;
    setLoading(true);
    try {
      const [{ data: enrollments, error: enrErr }, { data: attData, error: attErr }] = await Promise.all([
        getClassEnrollments(selectedClass.id),
        getAttendanceByDate(selectedClass.id, selectedDate.format('YYYY-MM-DD'))
      ]);
      if (enrErr) throw enrErr;
      if (attErr) throw attErr;
      const studentsList = (enrollments || []).map(e => e.students).filter(Boolean);
      setStudents(studentsList);
      const attMap = (attData || []).reduce((m, r) => { m[r.student_id] = r; return m; }, {});
      setAttendanceRecords(studentsList.map(s => ({
        student_id: s.id,
        name: s.full_name,
        present: attMap[s.id]?.status ?? null,
        attendance_id: attMap[s.id]?.id || null,
        notes: attMap[s.id]?.notes || ''
      })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const togglePresent = (sid) => {
    setAttendanceRecords(prev => prev.map(r => r.student_id === sid ? { ...r, present: r.present === true ? false : true } : r));
    setHasChanges(true);
  };
  const changeNotes = (sid, v) => { setAttendanceRecords(p => p.map(r => r.student_id === sid ? { ...r, notes: v } : r)); setHasChanges(true); };
  const markAll = () => { setAttendanceRecords(p => p.map(r => ({ ...r, present: true }))); setHasChanges(true); };

  const save = async () => {
    setSaving(true);
    try {
      const tasks = attendanceRecords.filter(r => r.present !== null).map(r => {
        const payload = { student_id: r.student_id, class_id: selectedClass.id, date: selectedDate.format('YYYY-MM-DD'), status: r.present, notes: r.notes };
        return r.attendance_id ? updateAttendance(r.attendance_id, payload) : markAttendance(payload);
      });
      await Promise.all(tasks);
      showNotification('Đã lưu điểm danh', 'success');
      setHasChanges(false);
      fetchAttendance();
    } catch (e) { showNotification('Lỗi lưu: ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const presentCount = attendanceRecords.filter(r => r.present === true).length;
  const total = attendanceRecords.length;
  const absentCount = attendanceRecords.filter(r => r.present === false).length;
  const rate = total ? Math.round((presentCount / total) * 100) : 0;

  const openQr = () => {
    setQrDialog(true); setScannedStudentId(null);
    setTimeout(() => {
      if (qrRef.current) {
        const inst = new Html5QrcodeScanner('teacher-qr', { fps: 10, qrbox: 230 });
        inst.render((text)=> handleQrScan(text), ()=>{});
        setScanner(inst);
      }
    }, 400);
  };
  const closeQr = () => { if (scanner) scanner.clear(); setQrDialog(false); };

  const handleQrScan = (decoded) => {
    const rec = attendanceRecords.find(r => r.student_id.toString() === decoded.toString());
    if (!rec) { showNotification('Không tìm thấy học sinh trong lớp', 'warning'); return; }
    togglePresent(rec.student_id);
    setScannedStudentId(rec.student_id);
    showNotification('Đã điểm danh: ' + rec.name, 'success');
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>Điểm danh lớp học</Typography>
      <Paper sx={{ p:2, mb:3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Lớp</InputLabel>
              <Select value={selectedClass?.id||''} label="Lớp" onChange={(e)=>{const c=classes.find(cl=>cl.id===e.target.value);setSelectedClass(c);}}>
                {classes.map(c=> <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField type="date" fullWidth size="small" label="Ngày" InputLabelProps={{shrink:true}} value={selectedDate.format('YYYY-MM-DD')} onChange={e=>setSelectedDate(dayjs(e.target.value))} />
          </Grid>
          <Grid item xs={12} md={5} display="flex" gap={1}>
            <Button variant="contained" disabled={!selectedClass} onClick={()=>setAttendanceDialog(true)}>Điểm danh</Button>
            <Button variant="outlined" disabled={!selectedClass} onClick={openQr} startIcon={<QrCodeScannerIcon/>}>QR</Button>
            <Button variant="contained" color="success" disabled={!hasChanges} onClick={save} startIcon={<Save as SaveIcon/>}>Lưu</Button>
          </Grid>
        </Grid>
      </Paper>
      {selectedClass && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}><Card><CardContent><Typography>Tổng học sinh: {total}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={4}><Card><CardContent><Typography>Có mặt: {presentCount}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={4}><Card><CardContent><Typography>Tỷ lệ: {rate}%</Typography></CardContent></Card></Grid>
        </Grid>) }
      {attendanceRecords.length>0 && (
        <Paper sx={{p:2}}>
          <Typography variant="subtitle1" mb={1}>Danh sách</Typography>
          <List>
            {attendanceRecords.map(r=> (
              <ListItem key={r.student_id} divider secondaryAction={<Checkbox checked={r.present===true} onChange={()=>togglePresent(r.student_id)} /> }>
                <ListItemAvatar><Avatar>{r.name?.charAt(0)}</Avatar></ListItemAvatar>
                <ListItemText primary={r.name} secondary={r.present===true ? 'Có mặt' : r.present===false ? 'Vắng' : 'Chưa điểm danh'} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Dialog open={attendanceDialog} onClose={()=>setAttendanceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Điểm danh thủ công</DialogTitle>
        <DialogContent dividers>
          <Button size="small" onClick={markAll} sx={{mb:1}}>Đánh dấu tất cả có mặt</Button>
          <List>
            {attendanceRecords.map(r=> (
              <ListItem key={r.student_id} divider>
                <ListItemAvatar><Avatar>{r.name?.charAt(0)}</Avatar></ListItemAvatar>
                <ListItemText primary={r.name} secondary={`ID: ${r.student_id}`} />
                <FormControlLabel control={<Checkbox checked={r.present===true} onChange={()=>togglePresent(r.student_id)} />} label="Có mặt" />
                <TextField size="small" value={r.notes} onChange={e=>changeNotes(r.student_id,e.target.value)} placeholder="Ghi chú" sx={{ml:1}} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setAttendanceDialog(false)}>Đóng</Button>
          <Button onClick={save} disabled={!hasChanges || saving} startIcon={saving && <CircularProgress size={16}/>}>Lưu</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={qrDialog} onClose={closeQr} maxWidth="sm" fullWidth>
        <DialogTitle>Quét QR</DialogTitle>
        <DialogContent>
          <Box id="teacher-qr" ref={qrRef} sx={{width:'100%', minHeight:260}} />
          {scannedStudentId && <Alert severity="success" sx={{mt:2}}>Đã điểm danh {attendanceRecords.find(r=>r.student_id===scannedStudentId)?.name}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeQr}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeacherAttendance;
