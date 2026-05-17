const Goal = require('../models/Goal');
const CheckIn = require('../models/CheckIn');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const ExcelJS = require('exceljs');

// @desc    Get report data
// @route   GET /api/reports
const getReportData = async (req, res, next) => {
  try {
    const { year, quarter, department, format } = req.query;
    const currentYear = parseInt(year) || new Date().getFullYear();

    let userFilter = { isActive: true, role: 'employee' };
    if (department) userFilter.department = department;

    const employees = await User.find(userFilter).select('name email department designation managerId');

    const reportData = await Promise.all(employees.map(async (emp) => {
      const goals = await Goal.find({ owner: emp._id, year: currentYear });
      const checkIns = await CheckIn.find({ employeeId: emp._id, year: currentYear });
      const completedGoals = goals.filter(g => checkIns.some(ci => ci.goalId.toString() === g._id.toString() && ci.status === 'completed'));
      const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);
      const achievedWeightage = completedGoals.reduce((sum, g) => sum + g.weightage, 0);
      const performance = totalWeightage > 0 ? Math.round((achievedWeightage / totalWeightage) * 100) : 0;

      return {
        employee: emp.name,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        totalGoals: goals.length,
        approvedGoals: goals.filter(g => g.status === 'approved').length,
        completedGoals: completedGoals.length,
        performance,
        year: currentYear,
      };
    }));

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('GoalSync Report');
      sheet.columns = [
        { header: 'Employee', key: 'employee', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Department', key: 'department', width: 20 },
        { header: 'Designation', key: 'designation', width: 20 },
        { header: 'Total Goals', key: 'totalGoals', width: 12 },
        { header: 'Approved Goals', key: 'approvedGoals', width: 15 },
        { header: 'Completed Goals', key: 'completedGoals', width: 15 },
        { header: 'Performance %', key: 'performance', width: 15 },
        { header: 'Year', key: 'year', width: 10 },
      ];
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00685E' } };
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      reportData.forEach(row => sheet.addRow(row));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=GoalSync_Report_${currentYear}.xlsx`);
      await workbook.xlsx.write(res);
      return;
    }

    if (format === 'csv') {
      const headers = ['Employee', 'Email', 'Department', 'Designation', 'Total Goals', 'Approved Goals', 'Completed Goals', 'Performance %', 'Year'];
      const rows = reportData.map(r => [r.employee, r.email, r.department, r.designation, r.totalGoals, r.approvedGoals, r.completedGoals, r.performance, r.year]);
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=GoalSync_Report_${currentYear}.csv`);
      return res.send(csv);
    }

    res.status(200).json({ success: true, data: reportData });
  } catch (error) { next(error); }
};

// @desc    Get audit logs (Admin)
// @route   GET /api/reports/audit
const getAuditLogs = async (req, res, next) => {
  try {
    const { entity, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (entity) filter.entity = entity;
    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email role')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await AuditLog.countDocuments(filter);
    res.status(200).json({ success: true, logs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

module.exports = { getReportData, getAuditLogs };
