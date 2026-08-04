import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { brand } from '../../theme/palette';
import type { NavLeaf } from '../../types/nav';

interface SidebarItemProps {
  /** `module` is intentionally omitted — this component never reads it, only Sidebar's permission/feature gating does. */
  item: Omit<NavLeaf, 'module'>;
  collapsed: boolean;
  active: boolean;
  onNavigate?: () => void;
}

export default function SidebarItem({ item, collapsed, active, onNavigate }: SidebarItemProps) {
  const Icon = item.icon;

  const button = (
    <ListItemButton
      component={RouterLink}
      to={item.path}
      onClick={onNavigate}
      selected={active}
      sx={{
        borderRadius: 2,
        minHeight: 40,
        px: collapsed ? 1 : 1.5,
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 1.25,
        color: active ? brand.gold : 'text.secondary',
        '&.Mui-selected': {
          backgroundColor: alpha(brand.gold, 0.12),
          '&:hover': { backgroundColor: alpha(brand.gold, 0.18) },
        },
        '&:hover': { backgroundColor: alpha(brand.gold, 0.08) },
      }}
    >
      <Badge
        variant="dot"
        invisible={!item.badge}
        color="error"
        sx={{ '& .MuiBadge-badge': { top: 2, right: 2 } }}
      >
        <Icon size={19} strokeWidth={active ? 2.25 : 1.9} />
      </Badge>
      {!collapsed && (
        <Typography variant="body2" noWrap sx={{ fontWeight: active ? 700 : 500 }}>
          {item.label}
        </Typography>
      )}
    </ListItemButton>
  );

  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      {collapsed ? (
        <Tooltip title={item.label} placement="right">
          {button}
        </Tooltip>
      ) : (
        button
      )}
    </ListItem>
  );
}
