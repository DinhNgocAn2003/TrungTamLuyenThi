import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, List, ListItem, ListItemText, Button, CircularProgress, Divider } from '@mui/material';
import { getClassById, getClassEnrollments, getClassSchedules, getClassTeachers } from '../../services/supabase/classes';

// Simple dialog: always fetch fresh data from DB when opened
const ClassDetailDialog = ({ open, onClose, classItem }) => {
  const classId = classItem?.id;
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!open || !classId) return;
      setLoading(true); setError(null);
      try {
        const [
          { data: cls, error: clsErr },
          { data: enr, error: enrErr },
          { data: sch, error: schErr },
          { data: tch, error: tchErr }
        ] = await Promise.all([
          getClassById(classId),
          getClassEnrollments(classId),
          getClassSchedules(classId),
          getClassTeachers(classId)
        ]);
        if (clsErr) throw clsErr;
        if (enrErr) throw enrErr;
        if (schErr) throw schErr;
        if (tchErr) throw tchErr;
        setDetail(cls);
        const list = (enr || []).map(e => ({ id: e.student_id, full_name: e.students?.full_name || '—' }));
        setStudents(list);
        setSchedules(sch || []);
        setTeachers((tch || []).map(t => ({ id: t.id, name: t.full_name || t.name || '—' })));
      } catch (e) {
        setError(e.message || 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, classId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{detail?.name || classItem?.name || 'Chi tiết lớp'}</DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress size={32} /></Box>
        )}
        {!loading && error && (
          <Typography color="error" variant="body2">{error}</Typography>
        )}
        {!loading && !error && (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Môn học</Typography>
              <Typography variant="body1" fontWeight={500}>{detail?.subject?.name || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Mô tả</Typography>
              <Typography variant="body2">{detail?.description || '—'}</Typography>
            </Box>
            <Box display="flex" gap={4}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Trạng thái</Typography>
                <Typography variant="body2">{detail?.is_active ? 'Đang hoạt động' : 'Ngừng'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Số học sinh</Typography>
                <Typography variant="body2">{students.length}</Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Giáo viên phụ trách</Typography>
              <Typography variant="body2">
                {teachers.length ? teachers.map(t => t.name).join(', ') : '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>Thời gian học</Typography>
              {!schedules.length && <Typography variant="body2">Chưa có lịch.</Typography>}
              {!!schedules.length && (
    <List dense sx={{ maxHeight: 160, overflow:'auto', border:'1px solid #eee', borderRadius:1 }}>
                  {schedules.sort((a,b)=> (a.day_of_week||0)-(b.day_of_week||0)).map(sc => {
                    const st = sc.start_time?.slice(0,5) || '--:--';
                    const et = sc.end_time?.slice(0,5) || '--:--';
                    return (
                      <ListItem key={sc.id} sx={{ py:0.5 }}>
      <ListItemText primary={`Thứ ${sc.day_of_week}: ${st} - ${et}`} secondary={sc.location || '—'} />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>Danh sách học sinh</Typography>
              {students.length === 0 && <Typography variant="body2">Chưa có học sinh.</Typography>}
              {students.length > 0 && (
                <List dense sx={{ maxHeight: 260, overflow:'auto', border:'1px solid #e0e0e0', borderRadius: 1, px:0.5 }}>
                  {students.map(s => (
                    <ListItem key={s.id} disablePadding>
                      <ListItemText primary={s.full_name} secondary={`ID: ${s.id}`} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassDetailDialog;
