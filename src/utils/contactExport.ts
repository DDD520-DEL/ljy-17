import { FamilyMember, FamilyBranch, ContactExportOptions } from '@/types';
import { getGenerationName } from './dateUtils';

const getBranchName = (branchId: string | undefined, branches: FamilyBranch[]): string => {
  if (!branchId) return '';
  const branch = branches.find(b => b.id === branchId);
  return branch ? branch.name : '';
};

const escapeVCardValue = (value: string): string => {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
};

export const generateVCard = (member: FamilyMember, branches: FamilyBranch[], options: ContactExportOptions): string => {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  lines.push(`FN:${escapeVCardValue(member.name)}`);
  lines.push(`N:${escapeVCardValue(member.name)};;;`);

  if (member.phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(member.phone)}`);
  }

  const noteParts: string[] = [];
  noteParts.push(`关系: ${member.relationship}`);

  if (options.includeGeneration) {
    noteParts.push(`辈分: ${getGenerationName(member.generation)}`);
  }

  if (options.includeBranch) {
    const branchName = getBranchName(member.branchId, branches);
    if (branchName) {
      noteParts.push(`分支: ${branchName}`);
    }
  }

  if (options.includeBirthDate && member.birthDate) {
    noteParts.push(`出生日期: ${member.birthDate}`);
  }

  noteParts.push(`状态: ${member.isAlive ? '在世' : '已逝世'}`);

  if (noteParts.length > 0) {
    lines.push(`NOTE:${escapeVCardValue(noteParts.join('；'))}`);
  }

  lines.push('END:VCARD');

  return lines.join('\r\n');
};

export const generateVCards = (
  members: FamilyMember[],
  branches: FamilyBranch[],
  options: ContactExportOptions
): string => {
  const filteredMembers = options.scope === 'alive'
    ? members.filter(m => m.isAlive)
    : members;

  return filteredMembers
    .map(member => generateVCard(member, branches, options))
    .join('\r\n\r\n');
};

export const generateCSV = (
  members: FamilyMember[],
  branches: FamilyBranch[],
  options: ContactExportOptions
): string => {
  const filteredMembers = options.scope === 'alive'
    ? members.filter(m => m.isAlive)
    : members;

  const headers = ['姓名', '关系', '电话', '性别', '状态'];

  if (options.includeGeneration) {
    headers.push('辈分');
  }
  if (options.includeBranch) {
    headers.push('分支');
  }
  if (options.includeBirthDate) {
    headers.push('出生日期');
  }

  const rows = filteredMembers.map(member => {
    const row = [
      member.name,
      member.relationship,
      member.phone || '',
      member.gender === 'male' ? '男' : '女',
      member.isAlive ? '在世' : '已逝世',
    ];

    if (options.includeGeneration) {
      row.push(getGenerationName(member.generation));
    }
    if (options.includeBranch) {
      row.push(getBranchName(member.branchId, branches));
    }
    if (options.includeBirthDate) {
      row.push(member.birthDate || '');
    }

    return row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

export const generatePrintHTML = (
  members: FamilyMember[],
  branches: FamilyBranch[],
  options: ContactExportOptions
): string => {
  const filteredMembers = options.scope === 'alive'
    ? members.filter(m => m.isAlive)
    : members;

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const genDiff = a.generation - b.generation;
    if (genDiff !== 0) return genDiff;
    return a.name.localeCompare(b.name, 'zh-CN');
  });

  const hasBranchInfo = options.includeBranch && sortedMembers.some(m => m.branchId);

  const columns = [
    { key: 'name', label: '姓名', width: '15%' },
    { key: 'relationship', label: '关系', width: '12%' },
    { key: 'phone', label: '联系电话', width: '18%' },
    { key: 'gender', label: '性别', width: '8%' },
  ];

  if (options.includeGeneration) {
    columns.push({ key: 'generation', label: '辈分', width: '10%' });
  }
  if (hasBranchInfo) {
    columns.push({ key: 'branch', label: '分支', width: '12%' });
  }
  if (options.includeBirthDate) {
    columns.push({ key: 'birthDate', label: '出生日期', width: '15%' });
  }
  columns.push({ key: 'status', label: '状态', width: '10%' });

  const scopeText = options.scope === 'alive' ? '（仅在世成员）' : '（全部成员）';
  const totalCount = sortedMembers.length;
  const aliveCount = sortedMembers.filter(m => m.isAlive).length;
  const deceasedCount = totalCount - aliveCount;

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>家族通讯录</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
      background: #fff;
      color: #333;
      padding: 40px;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #8B4513;
    }
    .header h1 {
      font-family: 'Noto Serif SC', serif;
      font-size: 28px;
      color: #8B4513;
      margin-bottom: 10px;
    }
    .header .subtitle {
      font-size: 14px;
      color: #666;
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin: 20px 0;
      padding: 15px;
      background: #FAF0E6;
      border-radius: 8px;
    }
    .stat-item {
      text-align: center;
    }
    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #8B4513;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 14px;
    }
    thead {
      background: #8B4513;
      color: #fff;
    }
    th {
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #6b3410;
    }
    td {
      padding: 10px 8px;
      border: 1px solid #d4b9a4;
    }
    tbody tr:nth-child(even) {
      background: #FAF0E6;
    }
    tbody tr:hover {
      background: #F5E6D3;
    }
    .deceased {
      color: #999;
    }
    .alive-badge {
      display: inline-block;
      padding: 2px 8px;
      background: #dcfce7;
      color: #166534;
      border-radius: 4px;
      font-size: 12px;
    }
    .deceased-badge {
      display: inline-block;
      padding: 2px 8px;
      background: #f3ebe4;
      color: #6b3410;
      border-radius: 4px;
      font-size: 12px;
    }
    .footer {
      margin-top: 30px;
      text-align: right;
      font-size: 12px;
      color: #999;
      padding-top: 15px;
      border-top: 1px solid #d4b9a4;
    }
    @media print {
      body { padding: 20px; }
      .header { border-bottom-color: #000; }
      thead { background: #f0f0f0 !important; color: #000 !important; }
      th { border-color: #000 !important; }
      td { border-color: #ccc !important; }
      .alive-badge, .deceased-badge {
        background: transparent !important;
        border: 1px solid #999;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>家族通讯录${scopeText}</h1>
    <div class="subtitle">生成时间：${new Date().toLocaleString('zh-CN')}</div>
  </div>

  <div class="stats">
    <div class="stat-item">
      <div class="stat-number">${totalCount}</div>
      <div class="stat-label">总人数</div>
    </div>
    <div class="stat-item">
      <div class="stat-number">${aliveCount}</div>
      <div class="stat-label">在世</div>
    </div>
    <div class="stat-item">
      <div class="stat-number">${deceasedCount}</div>
      <div class="stat-label">已逝世</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        ${columns.map(col => `<th style="width: ${col.width}">${col.label}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${sortedMembers.map(member => {
        const isDeceased = !member.isAlive;
        const rowClass = isDeceased ? 'deceased' : '';
        return `
          <tr class="${rowClass}">
            <td>${member.name}</td>
            <td>${member.relationship}</td>
            <td>${member.phone || '-'}</td>
            <td>${member.gender === 'male' ? '男' : '女'}</td>
            ${options.includeGeneration ? `<td>${getGenerationName(member.generation)}</td>` : ''}
            ${hasBranchInfo ? `<td>${getBranchName(member.branchId, branches) || '-'}</td>` : ''}
            ${options.includeBirthDate ? `<td>${member.birthDate || '-'}</td>` : ''}
            <td>
              <span class="${member.isAlive ? 'alive-badge' : 'deceased-badge'}">
                ${member.isAlive ? '在世' : '已逝世'}
              </span>
            </td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="footer">
    家族祭祀管理平台 · 通讯录导出
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;
};

export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportContacts = (
  members: FamilyMember[],
  branches: FamilyBranch[],
  options: ContactExportOptions
): void => {
  const dateStr = new Date().toISOString().split('T')[0];
  const scopeSuffix = options.scope === 'alive' ? '_在世成员' : '';

  switch (options.format) {
    case 'vcard': {
      const content = generateVCards(members, branches, options);
      downloadFile(content, `家族通讯录${scopeSuffix}_${dateStr}.vcf`, 'text/vcard');
      break;
    }
    case 'csv': {
      const content = generateCSV(members, branches, options);
      const BOM = '\uFEFF';
      downloadFile(BOM + content, `家族通讯录${scopeSuffix}_${dateStr}.csv`, 'text/csv;charset=utf-8');
      break;
    }
    case 'print': {
      const content = generatePrintHTML(members, branches, options);
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(content);
        newWindow.document.close();
      }
      break;
    }
  }
};
