import { Alert, Card, Typography } from 'antd';

const { Title } = Typography;

const SeatingPage = () => {
  return (
    <Card>
      <Title level={4}>Seating Arrangement</Title>
      <Alert
        message="Under Development"
        description="This feature is currently under development. Please check back later."
        type="info"
        showIcon
      />
    </Card>
  );
};

export default SeatingPage;