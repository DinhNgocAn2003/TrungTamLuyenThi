import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  Autocomplete,
  TextField
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Class as ClassIcon
} from '@mui/icons-material';
import { 
  getSubjectGradeCombinations,
  createSubjectGradeCombination 
} from '../../services/supabase/teacherAssignments';

const SubjectGradeSelector = ({ 
  teacherId, 
  selectedSubjectGrades = [], 
  onSelectionChange,
  subjects = [],
  grades = [],
  disabled = false 
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [localSelections, setLocalSelections] = useState(selectedSubjectGrades);
  const [availableCombinations, setAvailableCombinations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Đồng bộ với props
  useEffect(() => {
    setLocalSelections(selectedSubjectGrades);
  }, [selectedSubjectGrades]);

  // Load available subject-grade combinations
  useEffect(() => {
    loadAvailableCombinations();
  }, []);

  const loadAvailableCombinations = async () => {
    try {
      const { data, error } = await getSubjectGradeCombinations();
      if (error) {
        console.error('Error loading combinations:', error);
      } else {
        setAvailableCombinations(data || []);
      }
    } catch (error) {
      console.error('Error loading combinations:', error);
    }
  };

  // Sử dụng dữ liệu grades từ props hoặc fallback
  const defaultGrades = grades.length > 0 ? grades : [
    { id: 1, name: 'Lớp 6', grade: 6 },
    { id: 2, name: 'Lớp 7', grade: 7 },
    { id: 3, name: 'Lớp 8', grade: 8 },
    { id: 4, name: 'Lớp 9', grade: 9 },
    { id: 5, name: 'Lớp 10', grade: 10 },
    { id: 6, name: 'Lớp 11', grade: 11 },
    { id: 7, name: 'Lớp 12', grade: 12 }
  ];

  const handleAddSubjectGrade = async () => {
    if (!selectedSubject || !selectedGrade) {
      return;
    }

    const subject = subjects.find(s => s.id === selectedSubject);
    const grade = defaultGrades.find(g => g.id === selectedGrade);
    
    if (!subject || !grade) {
      return;
    }

    try {
      setLoading(true);

      // Kiểm tra xem đã tồn tại chưa
      const exists = localSelections.some(
        item => item.subject_id === selectedSubject && item.grade_id === selectedGrade
      );

      if (exists) {
        return;
      }

      // Tạo hoặc lấy subject-grade combination
      const { data: combination, error } = await createSubjectGradeCombination(selectedSubject, selectedGrade);
      
      if (error) {
        console.error('Error creating combination:', error);
        return;
      }

      const newSelection = {
        id: combination.id,
        subject_id: selectedSubject,
        grade_id: selectedGrade,
        subject_name: subject.name,
        grade_name: grade.name,
        teacher_id: teacherId,
        subjects_grades_id: combination.id
      };

      const updatedSelections = [...localSelections, newSelection];
      setLocalSelections(updatedSelections);
      onSelectionChange(updatedSelections);

      // Reload available combinations
      await loadAvailableCombinations();

      // Reset form
      setSelectedSubject('');
      setSelectedGrade('');
      setOpenDialog(false);
    } catch (error) {
      console.error('Error adding subject grade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubjectGrade = (index) => {
    const updatedSelections = localSelections.filter((_, i) => i !== index);
    setLocalSelections(updatedSelections);
    onSelectionChange(updatedSelections);
  };

  const getSubjectGradeCombinations = () => {
    return localSelections.map((item, index) => ({
      ...item,
      index,
      displayText: `${item.subject_name} - ${item.grade_name}`
    }));
  };

  return (
    <Box>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <SchoolIcon />
              Môn học - Lớp được phân công
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              disabled={disabled}
              size="small"
            >
              Thêm phân công
            </Button>
          </Box>

          {localSelections.length === 0 ? (
            <Alert severity="info" sx={{ textAlign: 'center' }}>
              Chưa có phân công nào. Nhấn "Thêm phân công" để bắt đầu.
            </Alert>
          ) : (
            <Grid container spacing={1}>
              {getSubjectGradeCombinations().map((item) => (
                <Grid item key={`${item.subject_id}-${item.grade_id}`}>
                  <Chip
                    label={item.displayText}
                    onDelete={disabled ? undefined : () => handleRemoveSubjectGrade(item.index)}
                    color="primary"
                    variant="outlined"
                    icon={<ClassIcon />}
                    sx={{ m: 0.5 }}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {localSelections.length > 0 && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                Tổng cộng: {localSelections.length} phân công
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog thêm phân công */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AddIcon />
            Thêm phân công môn học - lớp
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Chọn môn học</InputLabel>
                <Select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  label="Chọn môn học"
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <SchoolIcon fontSize="small" />
                        {subject.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Chọn lớp</InputLabel>
                <Select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  label="Chọn lớp"
                >
                  {defaultGrades.map((grade) => (
                    <MenuItem key={grade.id} value={grade.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ClassIcon fontSize="small" />
                        {grade.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {selectedSubject && selectedGrade && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography>
                    <strong>Sẽ thêm phân công:</strong> {' '}
                    {subjects.find(s => s.id === selectedSubject)?.name} - {' '}
                    {defaultGrades.find(g => g.id === selectedGrade)?.name}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {localSelections.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Phân công hiện tại:
                </Typography>
                <List dense>
                  {getSubjectGradeCombinations().map((item) => (
                    <ListItem key={`${item.subject_id}-${item.grade_id}`}>
                      <ListItemText
                        primary={item.displayText}
                        secondary={`Môn: ${item.subject_name}, Lớp: ${item.grade_name}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleRemoveSubjectGrade(item.index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddSubjectGrade}
            disabled={!selectedSubject || !selectedGrade || loading}
          >
            {loading ? 'Đang thêm...' : 'Thêm phân công'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectGradeSelector;
