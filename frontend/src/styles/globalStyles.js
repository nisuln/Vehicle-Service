export const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --cream: #FAF8F5;
    --white: #FFFFFF;
    --gray-50: #F5F4F1;
    --gray-100: #EBEBEB;
    --gray-200: #D6D6D6;
    --gray-300: #B8B8B8;
    --gray-400: #8C8C8C;
    --gray-500: #636363;
    --gray-600: #454545;
    --gray-700: #2E2E2E;
    --gray-800: #1A1A1A;
    --navy: #0F1B2D;
    --navy-mid: #1C3354;
    --accent: #E84C1E;
    --accent-light: #FFF0EB;
    --accent-mid: #F97B52;
    --green: #18A05B;
    --green-light: #E8F8EF;
    --amber: #D97706;
    --amber-light: #FEF3C7;
    --red: #DC2626;
    --red-light: #FEE2E2;
    --blue: #2563EB;
    --blue-light: #DBEAFE;
    --font: 'DM Sans', sans-serif;
    --mono: 'DM Mono', monospace;
    --radius: 10px;
    --radius-sm: 6px;
    --shadow: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06);
    --shadow-md: 0 4px 12px rgba(0,0,0,.10), 0 2px 4px rgba(0,0,0,.06);
    --shadow-lg: 0 10px 30px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.08);
  }

  body { font-family: var(--font); background: var(--cream); color: var(--gray-800); font-size: 14px; line-height: 1.5; }

  .nav { background: var(--navy); display: flex; align-items: center; height: 58px; padding: 0 24px; gap: 0; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 12px rgba(0,0,0,.18); }
  .nav-brand { display: flex; align-items: center; gap: 10px; color: white; font-weight: 700; font-size: 16px; letter-spacing: -.3px; margin-right: 32px; white-space: nowrap; }
  .nav-brand-icon { width: 32px; height: 32px; background: var(--accent); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
  .nav-tabs { display: flex; gap: 2px; flex: 1; overflow-x: auto; scrollbar-width: none; }
  .nav-tabs::-webkit-scrollbar { display: none; }
  .nav-tab { display: flex; align-items: center; gap: 7px; padding: 6px 14px; border-radius: 7px; color: rgba(255,255,255,.6); font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; white-space: nowrap; border: none; background: none; }
  .nav-tab:hover { color: white; background: rgba(255,255,255,.08); }
  .nav-tab.active { color: white; background: rgba(255,255,255,.14); }
  .nav-badge { background: var(--accent); color: white; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 20px; line-height: 16px; }

  .page { padding: 28px 32px; max-width: 1400px; margin: 0 auto; }
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .page-title { font-size: 22px; font-weight: 700; color: var(--gray-800); letter-spacing: -.4px; }
  .page-sub { font-size: 13px; color: var(--gray-400); margin-top: 2px; }

  .card { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--gray-100); }
  .card-header { padding: 16px 20px; border-bottom: 1px solid var(--gray-100); display: flex; align-items: center; justify-content: space-between; }
  .card-body { padding: 20px; }

  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: var(--white); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); border: 1px solid var(--gray-100); }
  .stat-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .6px; color: var(--gray-400); margin-bottom: 8px; }
  .stat-value { font-size: 28px; font-weight: 700; color: var(--gray-800); letter-spacing: -1px; line-height: 1; }
  .stat-sub { font-size: 12px; color: var(--gray-400); margin-top: 4px; }
  .stat-accent { color: var(--accent); }
  .stat-green { color: var(--green); }
  .stat-amber { color: var(--amber); }

  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius-sm); font-family: var(--font); font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .15s; line-height: 1; }
  .btn-primary { background: var(--navy); color: white; }
  .btn-primary:hover { background: var(--navy-mid); }
  .btn-accent { background: var(--accent); color: white; }
  .btn-accent:hover { background: #C93F18; }
  .btn-ghost { background: transparent; color: var(--gray-600); border: 1px solid var(--gray-200); }
  .btn-ghost:hover { background: var(--gray-50); }
  .btn-danger { background: var(--red-light); color: var(--red); border: none; }
  .btn-danger:hover { background: #FECACA; }
  .btn-success { background: var(--green-light); color: var(--green); border: none; }
  .btn-success:hover { background: #BBF7D0; }
  .btn-sm { padding: 5px 10px; font-size: 12px; }
  .btn-icon { padding: 6px; border-radius: var(--radius-sm); }

  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-pending { background: var(--amber-light); color: var(--amber); }
  .badge-in-progress { background: var(--blue-light); color: var(--blue); }
  .badge-completed { background: var(--green-light); color: var(--green); }
  .badge-paid { background: var(--green-light); color: var(--green); }
  .badge-unpaid { background: var(--red-light); color: var(--red); }
  .badge-confirmed { background: var(--green-light); color: var(--green); }
  .badge-cancelled { background: var(--red-light); color: var(--red); }
  .badge-urgent { background: #FEE2E2; color: #B91C1C; }
  .badge-high { background: var(--amber-light); color: #92400E; }
  .badge-normal { background: var(--gray-100); color: var(--gray-500); }
  .badge-low-stock { background: var(--red-light); color: var(--red); }
  .badge-ok { background: var(--green-light); color: var(--green); }

  .table-wrap { overflow-x: auto; border-radius: var(--radius); }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: var(--gray-400); background: var(--gray-50); border-bottom: 1px solid var(--gray-100); white-space: nowrap; }
  td { padding: 12px 14px; border-bottom: 1px solid var(--gray-100); font-size: 13px; color: var(--gray-700); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--gray-50); }
  .td-mono { font-family: var(--mono); font-size: 12px; color: var(--gray-500); }
  .td-bold { font-weight: 600; color: var(--gray-800); }

  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 12px; font-weight: 600; color: var(--gray-600); margin-bottom: 5px; letter-spacing: .2px; }
  .form-input, .form-select, .form-textarea { width: 100%; padding: 9px 12px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm); font-family: var(--font); font-size: 13px; color: var(--gray-800); background: var(--white); transition: border-color .15s; outline: none; }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--navy); }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

  .modal-backdrop { position: fixed; inset: 0; background: rgba(15,27,45,.55); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(3px); }
  .modal { background: white; border-radius: 14px; box-shadow: var(--shadow-lg); width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto; }
  .modal-lg { max-width: 800px; }
  .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--gray-100); display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: white; z-index: 1; border-radius: 14px 14px 0 0; }
  .modal-title { font-size: 16px; font-weight: 700; color: var(--gray-800); }
  .modal-body { padding: 24px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--gray-100); display: flex; justify-content: flex-end; gap: 10px; }

  .kanban { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: start; }
  .kanban-col { background: var(--gray-50); border-radius: var(--radius); padding: 16px; }
  .kanban-col-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .kanban-col-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; }
  .kanban-count { background: var(--gray-200); color: var(--gray-600); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
  .kanban-card { background: white; border-radius: 8px; padding: 14px; box-shadow: var(--shadow); border: 1px solid var(--gray-100); margin-bottom: 10px; cursor: default; }
  .kanban-card:last-child { margin-bottom: 0; }
  .kanban-card-id { font-family: var(--mono); font-size: 11px; color: var(--gray-400); margin-bottom: 6px; }
  .kanban-card-title { font-size: 13px; font-weight: 600; color: var(--gray-800); margin-bottom: 4px; }
  .kanban-card-sub { font-size: 12px; color: var(--gray-400); margin-bottom: 8px; }
  .kanban-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--gray-100); }
  .kanban-card-mechanic { font-size: 12px; color: var(--gray-500); display: flex; align-items: center; gap: 5px; }
  .avatar { width: 22px; height: 22px; border-radius: 50%; background: var(--navy); color: white; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }

  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
  .cal-header-cell { text-align: center; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--gray-400); padding: 8px 0; }
  .cal-cell { min-height: 80px; border-radius: 8px; border: 1.5px solid var(--gray-100); padding: 8px; background: white; position: relative; }
  .cal-cell.today { border-color: var(--navy); }
  .cal-cell.other-month { background: var(--gray-50); opacity: .5; }
  .cal-day-num { font-size: 12px; font-weight: 600; color: var(--gray-700); margin-bottom: 4px; }
  .cal-day-num.today-num { background: var(--navy); color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; }
  .cal-event { background: var(--navy); color: white; border-radius: 4px; padding: 2px 5px; font-size: 10px; font-weight: 500; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
  .cal-event.confirmed { background: var(--green); }
  .cal-event.pending { background: var(--amber); }

  .search-bar { display: flex; align-items: center; gap: 8px; background: white; border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm); padding: 7px 12px; color: var(--gray-400); min-width: 240px; }
  .search-bar input { border: none; outline: none; font-family: var(--font); font-size: 13px; color: var(--gray-700); background: transparent; flex: 1; }
  .search-bar input::placeholder { color: var(--gray-300); }

  .inv-preview { background: white; border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 32px; }
  .inv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
  .inv-logo { font-size: 20px; font-weight: 800; color: var(--navy); letter-spacing: -.5px; }
  .inv-logo span { color: var(--accent); }
  .inv-meta { text-align: right; }
  .inv-meta h2 { font-size: 26px; font-weight: 800; color: var(--gray-800); letter-spacing: -1px; }
  .inv-meta-id { font-family: var(--mono); font-size: 13px; color: var(--accent); margin-top: 2px; }
  .inv-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; padding-bottom: 28px; border-bottom: 1px solid var(--gray-100); }
  .inv-party-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: var(--gray-400); margin-bottom: 6px; }
  .inv-party-name { font-size: 15px; font-weight: 700; color: var(--gray-800); }
  .inv-party-detail { font-size: 12px; color: var(--gray-500); line-height: 1.7; }
  .inv-table th { background: var(--navy); color: white; font-size: 11px; }
  .inv-totals { margin-top: 20px; display: flex; justify-content: flex-end; }
  .inv-totals-box { min-width: 220px; }
  .inv-total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; color: var(--gray-600); }
  .inv-total-row.grand { font-size: 16px; font-weight: 700; color: var(--gray-800); border-top: 2px solid var(--gray-200); padding-top: 10px; margin-top: 5px; }

  .progress-bar { height: 6px; background: var(--gray-100); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width .3s; }

  .filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .chip { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1.5px solid var(--gray-200); background: white; color: var(--gray-600); transition: all .15s; }
  .chip.active { border-color: var(--navy); background: var(--navy); color: white; }
  .chip:hover:not(.active) { border-color: var(--gray-400); }

  .empty { text-align: center; padding: 48px; color: var(--gray-400); }
  .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: .4; }
  .empty-text { font-size: 14px; font-weight: 500; }

  .alert { padding: 12px 16px; border-radius: var(--radius-sm); font-size: 13px; display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .alert-warning { background: var(--amber-light); color: var(--amber); border: 1px solid #FDE68A; }

  .divider { border: none; border-top: 1px solid var(--gray-100); margin: 16px 0; }
  .tooltip-wrap { position: relative; display: inline-flex; }

  @media (max-width: 768px) {
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .kanban { grid-template-columns: 1fr; }
    .form-grid { grid-template-columns: 1fr; }
    .page { padding: 16px; }
  }
`;
