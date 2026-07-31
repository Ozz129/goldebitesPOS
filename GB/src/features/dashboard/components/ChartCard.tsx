import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  height?: number;
  children: React.ReactNode;
}

export default function ChartCard({ title, subtitle, height = 280, children }: ChartCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        <Box sx={{ height, mt: 1.5 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}
