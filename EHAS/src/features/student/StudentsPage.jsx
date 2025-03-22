import { useState, useEffect } from 'react';
import { Button, Table, Space, Card, Typography, message, Popconfirm } from 'antd';
import StudentForm from './components/StudentForm';
import BulkStudentUploadModal from './components/BulkStudentUploadModal';
import { getStudents, deleteStudent } from '../../services/studentAPI';
import { getStaff } from '../../services/staffAPI';

const { Title } = Typography;

const StudentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [staffMapping, setStaffMapping] = useState({});

  // Fetch the list of students from the API
  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      message.error('Failed to fetch students.');
    }
  };

  // Fetch staff list and build a mapping from staff _id to display name
  const fetchStaffMapping = async () => {
    try {
      const staffList = await getStaff();
      const mapping = {};
      staffList.forEach((staff) => {
        // Use staff.name if available, otherwise fallback to staff.staff_id or any other identifier.
        mapping[staff._id.toString()] = staff.name || staff.staff_id;
      });
      setStaffMapping(mapping);
    } catch (error) {
      message.error('Failed to fetch staff list.');
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchStaffMapping();
  }, []);

  const handleCreate = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteStudent(id);
      if (result) {
        message.success('Student deleted successfully!');
        fetchStudents();
      } else {
        message.error('Failed to delete student.');
      }
    } catch (error) {
      message.error('An error occurred while deleting the student.');
    }
  };

  // Bulk delete function for selected rows
  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.error('No students selected for deletion.');
      return;
    }
    try {
      for (let id of selectedRowKeys) {
        // eslint-disable-next-line no-await-in-loop
        await deleteStudent(id);
      }
      message.success('Selected students deleted successfully!');
      setSelectedRowKeys([]);
      fetchStudents();
    } catch (error) {
      message.error('An error occurred while bulk deleting students.');
    }
  };

  // Callback for modal close to refresh the student list
  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchStudents();
  };

  const handleBulkUploadComplete = () => {
    fetchStudents();
  };

  // Table columns to display student details including "Staff In Charge"
  const columns = [
    { title: 'Reg No', dataIndex: 'reg_no', key: 'reg_no' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Roll No', dataIndex: 'roll_no', key: 'roll_no' },
    { title: 'Semester', dataIndex: 'semester', key: 'semester' },
    {
      title: 'DOB',
      dataIndex: 'dob',
      key: 'dob',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    {
      title: 'Staff In Charge',
      dataIndex: 'staff_id',
      key: 'staff_incharge',
      render: (staff) => staff?.name || 'N/A',
    },    
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure you want to delete this student?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Row selection for bulk delete
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
  };

  return (
    <Card>
      <div className="flex justify-between mb-4">
        <Title level={4}>Students Management</Title>
        <div>
          <Button type="primary" onClick={handleCreate} style={{ marginRight: 8 }}>
            Create Student
          </Button>
          <Button onClick={() => setIsBulkModalOpen(true)} style={{ marginRight: 8 }}>
            Bulk Upload Students
          </Button>
          <Popconfirm
            title="Are you sure you want to delete selected students?"
            onConfirm={handleBulkDelete}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Bulk Delete</Button>
          </Popconfirm>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={students}
        rowKey="_id"
        bordered
        rowSelection={rowSelection}
      />

      <StudentForm
        open={isModalOpen}
        onClose={handleModalClose}
        initialValues={selectedStudent}
      />

      <BulkStudentUploadModal
        open={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onUploadComplete={handleBulkUploadComplete}
      />
    </Card>
  );
};

export default StudentsPage;
