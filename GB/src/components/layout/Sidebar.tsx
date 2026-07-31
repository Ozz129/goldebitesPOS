import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { ChevronsLeft, ChevronsRight, Crown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { MODULE_PERMISSIONS, NAV_ENTRIES } from '../../routes/navConfig';
import { usePermissions } from '../../modules/auth/hooks/use-permissions';
import { useUiStore } from '../../store/uiStore';
import { useCurrentBusiness } from '../../modules/businesses/hooks/use-current-business';
import { brand } from '../../theme/palette';
import SidebarItem from './SidebarItem';

export const SIDEBAR_WIDTH_EXPANDED = 264;
export const SIDEBAR_WIDTH_COLLAPSED = 76;

function BrandHeader({ collapsed }: { collapsed: boolean }) {
  const { data: business } = useCurrentBusiness();

  return (
    <Stack
      direction="row"

      spacing={1.25}
      sx={{ alignItems: "center", px: collapsed ? 1.5 : 2.5, py: 2.5, overflow: 'hidden' }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(brand.gold, 0.14),
          color: brand.gold,
          border: `1px solid ${alpha(brand.gold, 0.4)}`,
        }}
      >
        <Crown size={18} strokeWidth={2} />
      </Box>
      {!collapsed && (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
            {business?.name ?? '—'}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { hasPermission, hasAnyPermission } = usePermissions();
  const location = useLocation();
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);

  const can = (module: keyof typeof MODULE_PERMISSIONS): boolean => {
    const required = MODULE_PERMISSIONS[module];
    return Array.isArray(required) ? hasAnyPermission(required) : hasPermission(required);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <BrandHeader collapsed={collapsed} />
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: collapsed ? 1 : 1.5 }}>
        <List component="nav" disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {NAV_ENTRIES.map((entry) => {
            if (entry.kind === 'item') {
              if (!can(entry.module)) return null;
              return (
                <SidebarItem
                  key={entry.path}
                  item={entry}
                  collapsed={collapsed}
                  active={location.pathname === entry.path}
                  onNavigate={onNavigate}
                />
              );
            }
            const visibleItems = entry.items.filter((item) => can(item.module));
            if (visibleItems.length === 0) return null;
            return (
              <Box key={entry.label} sx={{ mt: 1 }}>
                {!collapsed && (
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ pl: 1.5, display: 'block', fontSize: '0.68rem' }}
                  >
                    {entry.label}
                  </Typography>
                )}
                {visibleItems.map((item) => (
                  <SidebarItem
                    key={item.path}
                    item={item}
                    collapsed={collapsed}
                    active={location.pathname === item.path}
                    onNavigate={onNavigate}
                  />
                ))}
              </Box>
            );
          })}
        </List>
      </Box>
      <Stack sx={{ alignItems: collapsed ? 'center' : 'flex-end', p: 1.25 }}>
        <Tooltip title={collapsed ? 'Expandir menú' : 'Colapsar menú'} placement="right">
          <IconButton
            size="small"
            onClick={toggleCollapsed}
            sx={{ color: 'text.secondary', display: { xs: 'none', md: 'inline-flex' } }}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

export default function Sidebar() {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const width = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
        slotProps={{ paper: { sx: { width: SIDEBAR_WIDTH_EXPANDED, borderRight: '1px solid', borderColor: 'divider' } } }}
      >
        <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          transition: (theme) => theme.transitions.create('width'),
          '& .MuiDrawer-paper': {
            width,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            overflowX: 'hidden',
            transition: (theme) => theme.transitions.create('width'),
          },
        }}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </Drawer>
    </>
  );
}
