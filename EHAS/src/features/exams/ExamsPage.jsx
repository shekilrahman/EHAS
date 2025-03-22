import { useState, useEffect } from 'react';
import { Button, Table, Space, Card, Typography, message, Popconfirm } from 'antd';
import ExamForm from './components/ExamForm';
import ExamRegistrationForm from './components/ExamRegistrationForm';
import BulkExamRegistrationModal from './components/BulkExamRegistrationModal';
import { getExams, deleteExam } from '../../services/examAPI';
import { getStudents } from '../../services/studentAPI';

const { Title } = Typography;

const ExamsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [exams, setExams] = useState([]);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isBulkRegistrationModalOpen, setIsBulkRegistrationModalOpen] = useState(false);

  // Fetch exams from the API
  const fetchExams = async () => {
    try {
      const data = await getExams();
      setExams(data);
    } catch (error) {
      message.error('Failed to fetch exams.');
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreate = () => {
    setSelectedExam(null);
    setIsModalOpen(true);
  };

  const handleEdit = (exam) => {
    setSelectedExam(exam);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteExam(id);
      if (result) {
        message.success('Exam deleted successfully!');
        fetchExams();
      } else {
        message.error('Failed to delete exam.');
      }
    } catch (error) {
      message.error('An error occurred while deleting the exam.');
    }
  };

  // For individual exam registration:
  const handleRegistration = (exam) => {
    setSelectedExam(exam);
    setIsRegistrationModalOpen(true);
  };

  // For bulk exam registration via CSV:
  const handleBulkRegistration = (exam) => {
    setSelectedExam(exam);
    setIsBulkRegistrationModalOpen(true);
  };

  // Print registered students for an exam
  const handlePrint = async (exam) => {
    try {
      const allStudents = await getStudents();
      // Filter students that have the exam registered in their exams array.
      const registeredStudents = allStudents.filter(student => 
        student.exams && student.exams.some(ex => {
          // If populated, ex.exam_id might be an object; otherwise a string.
          if (typeof ex.exam_id === 'object' && ex.exam_id._id) {
            return ex.exam_id._id === exam._id;
          }
          return ex.exam_id === exam._id;
        })
      );
      
      // Build printable HTML content.
      let printContent = `<h1>Registered Students for Exam: ${exam.course_code}</h1>`;
      printContent += `<table border="1" style="border-collapse:collapse;width:100%">
                        <thead>
                          <tr>
                            <th>Reg No</th>
                            <th>Name</th>
                            <th>Roll No</th>
                            <th>Semester</th>
                            <th>Department</th>
                          </tr>
                        </thead>
                        <tbody>`;
      registeredStudents.forEach(student => {
        printContent += `<tr>
                           <td>${student.reg_no}</td>
                           <td>${student.name}</td>
                           <td>${student.roll_no}</td>
                           <td>${student.semester}</td>
                           <td>${student.department}</td>
                         </tr>`;
      });
      printContent += `</tbody></table>`;
      
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write('<html><head><title>Print Registered Students</title>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } catch (error) {
      message.error('Failed to fetch registered students.');
    }
  };

  // Modal close callbacks
  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchExams();
  };
  const handleRegistrationModalClose = () => {
    setIsRegistrationModalOpen(false);
  };
  const handleBulkRegistrationModalClose = () => {
    setIsBulkRegistrationModalOpen(false);
  };

  // Table columns including Register, Bulk Register, and Print buttons
  const columns = [
    { title: 'Course Code', dataIndex: 'course_code', key: 'course_code' },
    { title: 'Course Name', dataIndex: 'course_name', key: 'course_name' },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => new Date(text).toLocaleString(),
    },
    { title: 'Seating', dataIndex: 'seating', key: 'seating' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure you want to delete this exam?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
          <Button onClick={() => handleRegistration(record)}>Register</Button>
          <Button onClick={() => handleBulkRegistration(record)}>Bulk Register</Button>
          <Button onClick={() => handlePrint(record)}>Print Registered</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div className="flex justify-between mb-4">
        <Title level={4}>Exams Management</Title>
        <Button type="primary" onClick={handleCreate}>
          Create Exam
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={exams} 
        rowKey="_id"
        bordered
      />

      <ExamForm 
        open={isModalOpen}
        onClose={handleModalClose}
        initialValues={selectedExam}
      />

      <ExamRegistrationForm 
        open={isRegistrationModalOpen}
        onClose={handleRegistrationModalClose}
        exam={selectedExam}
      />

      <BulkExamRegistrationModal
        open={isBulkRegistrationModalOpen}
        onClose={handleBulkRegistrationModalClose}
        exam={selectedExam}
      />
    </Card>
  );
};

export default ExamsPage;
