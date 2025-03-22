import { useState, useEffect } from 'react';
import { Modal, Select, Button, message } from 'antd';
import { getStudents, registerExamForStudent } from '../../../services/studentAPI';

const ExamRegistrationForm = ({ open, onClose, exam }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch the list of students once the modal is opened
  useEffect(() => {
    if (open) {
      const fetchStudents = async () => {
        try {
          const data = await getStudents();
          setStudents(data);
        } catch (error) {
          message.error('Failed to fetch students.');
        }
      };
      fetchStudents();
    }
  }, [open]);

  const handleSelectChange = (value) => {
    setSelectedStudentId(value);
    const student = students.find(s => s._id === value);
    setSelectedStudent(student);
  };

  const handleRegister = async () => {
    if (!selectedStudentId) {
      message.error('Please select a student.');
      return;
    }
    try {
      // Call the API to add the exam to the student's exams array
      const result = await registerExamForStudent(selectedStudentId, [{
        exam_id: exam._id,
        status: 'upcoming'
      }]);
      if (result) {
        message.success('Student registered for exam successfully!');
      } else {
        message.error('Failed to register exam for student.');
      }
    } catch (error) {
      message.error('An error occurred during registration.');
    }
    onClose();
  };

  return (
    <Modal
      title={`Register Student for Exam: ${exam?.course_code || ''}`}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="register" type="primary" onClick={handleRegister}>
          Register
        </Button>,
      ]}
    >
      <Select
        placeholder="Select a student"
        style={{ width: '100%' }}
        value={selectedStudentId}
        onChange={handleSelectChange}
      >
        {students.map(student => (
          <Select.Option key={student._id} value={student._id}>
            {student.reg_no} - {student.name}
          </Select.Option>
        ))}
      </Select>
      {selectedStudent && (
        <div style={{ marginTop: '16px', border: '1px solid #f0f0f0', padding: '12px', borderRadius: '4px' }}>
          <p><strong>Registration Number:</strong> {selectedStudent.reg_no}</p>
          <p><strong>Name:</strong> {selectedStudent.name}</p>
          <p><strong>Roll No:</strong> {selectedStudent.roll_no}</p>
          <p><strong>Semester:</strong> {selectedStudent.semester}</p>
          <p><strong>Department:</strong> {selectedStudent.department}</p>
          <p>
            <strong>Staff In Charge:</strong> {selectedStudent.staff_id?.name || selectedStudent.staff_id || 'N/A'}
          </p>
        </div>
      )}
    </Modal>
  );
};

export default ExamRegistrationForm;
