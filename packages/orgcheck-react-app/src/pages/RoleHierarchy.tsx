import Graphics from '@/components/orgcheck/Graphics';
import { useOrgCheck } from '@/context/OrgCheckContext';
import { usePageLoader } from '@/hooks/usePageLoader';
import { allPages, type NavPage } from '@/lib/navigation';
import { escapeHtml } from '@/lib/html';
import { asBoolean, asNumber, asRecord, asString } from '@/lib/table-types';

const PAGE: NavPage = allPages().find(page => page.key === '17') as NavPage;

const LEGEND = [
  { color: '#2f89a8', name: 'Root' },
  { color: '#fdc223', name: 'Empty role (no active user)' },
  { color: '#5fc9f8', name: 'Role with active members' },
];

export default function RoleHierarchy() {
  usePageLoader(PAGE);
  const { tableData, openModal } = useOrgCheck();

  return (
    <Graphics
      type="hierarchy"
      name="Internal Role Hierarchy"
      source={tableData.userrolestree}
      hierarchyShowLevel
      hierarchyBoxColorLegend={LEGEND}
      hierarchyBoxColorDecorator={(depth, data) => {
        if (depth === 0) return 0;
        const record = asRecord(asRecord(data)?.record);
        if (asBoolean(record?.hasActiveMembers) === false) return 1;
        return 2;
      }}
      hierarchyBoxInnerHtmlDecorator={(depth, data) => {
        if (depth === 0) return `<center><b>Role Hierarchy</b></center>`;
        const record = asRecord(asRecord(data)?.record);
        return `<center><b>${escapeHtml(asString(record?.name))}</b><br />${escapeHtml(asString(record?.apiname))}</center>`;
      }}
      hierarchyBoxOnClickDecorator={(depth, data) => {
        if (depth === 0) return;
        const record = asRecord(asRecord(data)?.record);
        if (!record) return;
        const members = Array.isArray(record.activeMemberRefs)
          ? record.activeMemberRefs
          : [];
        let html = `Role Name: <b>${escapeHtml(asString(record.name))}</b><br />`;
        html += `Salesforce Id: <b>${escapeHtml(asString(record.id))}</b><br />`;
        html += `Developer Name: <b>${escapeHtml(asString(record.apiname))}</b><br /><br />`;
        html += `Level in hierarchy: <b>${depth}</b><br /><br />`;
        html += `This role has ${asNumber(record.activeMembersCount) ?? 0} active user(s)<br /><ul>`;
        members.forEach(member => {
          html += `<li>${escapeHtml(asString(asRecord(member)?.name))}</li>`;
        });
        html += '</ul><br />';
        const parent = asRecord(record.parentRef);
        if (parent) {
          html += `Parent Role Name: <b>${escapeHtml(asString(parent.name))}</b><br />`;
          html += `Parent Salesforce Id: <b>${escapeHtml(asString(parent.id))}</b><br />`;
          html += `Parent Developer Name: <b>${escapeHtml(asString(parent.apiname))}</b><br />`;
        } else {
          html += 'No parent';
        }
        openModal(`Details for role ${asString(record.name)}`, html);
      }}
    />
  );
}
