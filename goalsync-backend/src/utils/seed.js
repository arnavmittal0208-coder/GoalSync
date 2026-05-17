require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Goal = require('../models/Goal');
const CheckIn = require('../models/CheckIn');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const GoalCycle = require('../models/GoalCycle');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Clear existing data
    await Promise.all([User.deleteMany(), Goal.deleteMany(), CheckIn.deleteMany(), Notification.deleteMany(), AuditLog.deleteMany(), GoalCycle.deleteMany()]);
    console.log('Cleared existing data...');

    // Create Admin
    const admin = await User.create({
      name: 'Sarah Mitchell',
      email: 'admin@goalsync.com',
      password: 'admin123',
      role: 'admin',
      department: 'Human Resources',
      designation: 'HR Director',
      phone: '+1 (555) 001-0001',
      avatar: 'SM',
      joinDate: new Date('2020-01-15'),
    });

    // Create Managers
    const manager1 = await User.create({
      name: 'David Chen',
      email: 'manager@goalsync.com',
      password: 'manager123',
      role: 'manager',
      department: 'Engineering',
      designation: 'Engineering Manager',
      phone: '+1 (555) 002-0001',
      avatar: 'DC',
      joinDate: new Date('2021-03-10'),
    });

    const manager2 = await User.create({
      name: 'Priya Sharma',
      email: 'manager2@goalsync.com',
      password: 'manager123',
      role: 'manager',
      department: 'Product',
      designation: 'Product Manager',
      phone: '+1 (555) 002-0002',
      avatar: 'PS',
      joinDate: new Date('2021-06-15'),
    });

    // Create Employees
    const emp1 = await User.create({
      name: 'Alex Johnson',
      email: 'employee@goalsync.com',
      password: 'employee123',
      role: 'employee',
      department: 'Engineering',
      designation: 'Senior Software Engineer',
      phone: '+1 (555) 003-0001',
      avatar: 'AJ',
      managerId: manager1._id,
      joinDate: new Date('2022-02-01'),
    });

    const emp2 = await User.create({
      name: 'Maria Garcia',
      email: 'maria.garcia@goalsync.com',
      password: 'employee123',
      role: 'employee',
      department: 'Engineering',
      designation: 'Frontend Developer',
      phone: '+1 (555) 003-0002',
      avatar: 'MG',
      managerId: manager1._id,
      joinDate: new Date('2022-05-15'),
    });

    const emp3 = await User.create({
      name: 'James Wilson',
      email: 'james.wilson@goalsync.com',
      password: 'employee123',
      role: 'employee',
      department: 'Engineering',
      designation: 'Backend Engineer',
      phone: '+1 (555) 003-0003',
      avatar: 'JW',
      managerId: manager1._id,
      joinDate: new Date('2022-08-01'),
    });

    const emp4 = await User.create({
      name: 'Emma Thompson',
      email: 'emma.thompson@goalsync.com',
      password: 'employee123',
      role: 'employee',
      department: 'Product',
      designation: 'Product Analyst',
      phone: '+1 (555) 003-0004',
      avatar: 'ET',
      managerId: manager2._id,
      joinDate: new Date('2023-01-10'),
    });

    const emp5 = await User.create({
      name: 'Ryan Patel',
      email: 'ryan.patel@goalsync.com',
      password: 'employee123',
      role: 'employee',
      department: 'Product',
      designation: 'UX Designer',
      phone: '+1 (555) 003-0005',
      avatar: 'RP',
      managerId: manager2._id,
      joinDate: new Date('2023-03-20'),
    });

    console.log('Users created...');

    // Create Goal Cycles
    const cycle2025 = await GoalCycle.create({
      name: 'FY 2025 Annual Goals',
      year: 2025,
      quarter: 'Annual',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      isActive: true,
      createdBy: admin._id,
      description: 'Annual performance goal cycle for 2025',
    });

    const cycleQ1 = await GoalCycle.create({
      name: 'Q1 2025',
      year: 2025,
      quarter: 'Q1',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-03-31'),
      isActive: false,
      createdBy: admin._id,
    });

    const cycleQ2 = await GoalCycle.create({
      name: 'Q2 2025',
      year: 2025,
      quarter: 'Q2',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-06-30'),
      isActive: false,
      createdBy: admin._id,
    });

    console.log('Cycles created...');

    // Create Goals for Alex (emp1) — approved
    const goal1 = await Goal.create({
      title: 'Deliver Microservices Migration',
      description: 'Migrate 5 core services to microservices architecture using Docker and Kubernetes',
      unit: 'numeric',
      target: 5,
      weightage: 30,
      status: 'approved',
      owner: emp1._id,
      isLocked: true,
      approvedBy: manager1._id,
      managerComment: 'Critical project for Q2. Ensure documentation is complete.',
      cycleId: cycle2025._id,
      year: 2025,
    });

    const goal2 = await Goal.create({
      title: 'Improve API Response Time',
      description: 'Reduce average API response time by 40% through optimization and caching',
      unit: 'percentage',
      target: 40,
      weightage: 25,
      status: 'approved',
      owner: emp1._id,
      isLocked: true,
      approvedBy: manager1._id,
      cycleId: cycle2025._id,
      year: 2025,
    });

    const goal3 = await Goal.create({
      title: 'Code Review Coverage',
      description: 'Achieve 90% code review coverage across all pull requests',
      unit: 'percentage',
      target: 90,
      weightage: 20,
      status: 'approved',
      owner: emp1._id,
      isLocked: true,
      approvedBy: manager1._id,
      cycleId: cycle2025._id,
      year: 2025,
    });

    const goal4 = await Goal.create({
      title: 'Complete AWS Certification',
      description: 'Obtain AWS Solutions Architect Professional certification',
      unit: 'zero-based',
      target: 1,
      weightage: 15,
      status: 'approved',
      owner: emp1._id,
      isLocked: true,
      approvedBy: manager1._id,
      cycleId: cycle2025._id,
      year: 2025,
    });

    const goal5 = await Goal.create({
      title: 'Team Knowledge Sharing Sessions',
      description: 'Conduct 4 tech talks or knowledge sharing sessions for the team',
      unit: 'numeric',
      target: 4,
      weightage: 10,
      status: 'approved',
      owner: emp1._id,
      isLocked: true,
      approvedBy: manager1._id,
      cycleId: cycle2025._id,
      year: 2025,
    });

    // Create Goals for Maria (emp2) — mix of submitted and approved
    const goal6 = await Goal.create({
      title: 'Launch New Design System',
      description: 'Build and deploy a company-wide React component library with Storybook',
      unit: 'zero-based',
      target: 1,
      weightage: 35,
      status: 'submitted',
      owner: emp2._id,
      cycleId: cycle2025._id,
      year: 2025,
    });

    const goal7 = await Goal.create({
      title: 'Accessibility Compliance',
      description: 'Bring all frontend components to WCAG 2.1 AA compliance',
      unit: 'percentage',
      target: 100,
      weightage: 30,
      status: 'submitted',
      owner: emp2._id,
      cycleId: cycle2025._id,
      year: 2025,
    });

    const goal8 = await Goal.create({
      title: 'Page Load Performance',
      description: 'Achieve Core Web Vitals Green Score across all pages',
      unit: 'zero-based',
      target: 1,
      weightage: 20,
      status: 'submitted',
      owner: emp2._id,
      cycleId: cycle2025._id,
      year: 2025,
    });

    const goal9 = await Goal.create({
      title: 'Frontend Testing Coverage',
      description: 'Increase unit test coverage from 45% to 80%',
      unit: 'percentage',
      target: 80,
      weightage: 15,
      status: 'submitted',
      owner: emp2._id,
      cycleId: cycle2025._id,
      year: 2025,
    });

    // Goals for James (emp3) — draft
    const goal10 = await Goal.create({
      title: 'Database Query Optimization',
      description: 'Optimize top 20 slow queries reducing execution time by 60%',
      unit: 'numeric',
      target: 20,
      weightage: 30,
      status: 'draft',
      owner: emp3._id,
      cycleId: cycle2025._id,
      year: 2025,
    });

    const goal11 = await Goal.create({
      title: 'Security Audit Compliance',
      description: 'Resolve all critical and high vulnerabilities from security audit',
      unit: 'percentage',
      target: 100,
      weightage: 40,
      status: 'draft',
      owner: emp3._id,
      cycleId: cycle2025._id,
      year: 2025,
    });

    const goal12 = await Goal.create({
      title: 'CI/CD Pipeline Enhancement',
      description: 'Reduce deployment time from 45 minutes to under 15 minutes',
      unit: 'timeline',
      target: 15,
      weightage: 30,
      status: 'draft',
      owner: emp3._id,
      cycleId: cycle2025._id,
      year: 2025,
    });

    console.log('Goals created...');

    // Create Check-ins for Alex's goals
    await CheckIn.create({ goalId: goal1._id, employeeId: emp1._id, quarter: 'Q1', year: 2025, achievement: 2, status: 'on-track', notes: 'Completed 2 out of 5 services migration. Auth and User services done.' });
    await CheckIn.create({ goalId: goal1._id, employeeId: emp1._id, quarter: 'Q2', year: 2025, achievement: 4, status: 'on-track', notes: 'Order and Inventory services migrated. Working on Payment service.' });
    await CheckIn.create({ goalId: goal2._id, employeeId: emp1._id, quarter: 'Q1', year: 2025, achievement: 15, status: 'on-track', notes: 'Implemented Redis caching, achieved 15% improvement so far.' });
    await CheckIn.create({ goalId: goal2._id, employeeId: emp1._id, quarter: 'Q2', year: 2025, achievement: 35, status: 'on-track', notes: 'Further optimized DB queries. 35% improvement achieved.', managerComment: 'Excellent progress! Keep up the momentum.' });
    await CheckIn.create({ goalId: goal3._id, employeeId: emp1._id, quarter: 'Q1', year: 2025, achievement: 85, status: 'on-track', notes: 'Set up mandatory PR review process in GitHub.' });
    await CheckIn.create({ goalId: goal4._id, employeeId: emp1._id, quarter: 'Q1', year: 2025, achievement: 0, status: 'not-started', notes: 'Scheduled exam for Q3.' });
    await CheckIn.create({ goalId: goal5._id, employeeId: emp1._id, quarter: 'Q1', year: 2025, achievement: 1, status: 'on-track', notes: 'Conducted Docker best practices session.' });
    await CheckIn.create({ goalId: goal5._id, employeeId: emp1._id, quarter: 'Q2', year: 2025, achievement: 3, status: 'on-track', notes: 'Two more sessions on K8s and API design.' });

    console.log('Check-ins created...');

    // Create Notifications
    await Notification.create({ userId: emp1._id, type: 'goal_approved', title: 'Goal Approved! 🎉', message: 'Your goal "Deliver Microservices Migration" has been approved.', isRead: false });
    await Notification.create({ userId: emp1._id, type: 'goal_approved', title: 'Goal Approved!', message: 'Your goal "Improve API Response Time" has been approved.', isRead: true });
    await Notification.create({ userId: emp1._id, type: 'checkin_reminder', title: 'Q3 Check-in Reminder', message: 'Please submit your Q3 2025 check-in updates by September 30.', isRead: false });
    await Notification.create({ userId: manager1._id, type: 'goal_submitted', title: 'Goals Submitted for Review', message: 'Maria Garcia has submitted 4 goals for your approval.', isRead: false });
    await Notification.create({ userId: manager1._id, type: 'goal_submitted', title: 'New Goals to Review', message: 'James Wilson has submitted goals for Q1 cycle.', isRead: true });
    await Notification.create({ userId: emp2._id, type: 'system', title: 'Goals Under Review', message: 'Your submitted goals are being reviewed by your manager.', isRead: false });
    await Notification.create({ userId: admin._id, type: 'system', title: 'Q2 Cycle Starting', message: 'Q2 2025 goal cycle starts on April 1st. Ensure all teams are prepared.', isRead: false });

    // Create Audit Logs
    await AuditLog.create({ action: 'CREATE', entity: 'Goal', entityId: goal1._id, userId: emp1._id, oldValue: null, newValue: { title: 'Deliver Microservices Migration', status: 'draft' } });
    await AuditLog.create({ action: 'APPROVE', entity: 'Goal', entityId: goal1._id, userId: manager1._id, oldValue: { status: 'submitted' }, newValue: { status: 'approved' } });
    await AuditLog.create({ action: 'CREATE', entity: 'Goal', entityId: goal2._id, userId: emp1._id, oldValue: null, newValue: { title: 'Improve API Response Time', status: 'draft' } });
    await AuditLog.create({ action: 'APPROVE', entity: 'Goal', entityId: goal2._id, userId: manager1._id, oldValue: { status: 'submitted' }, newValue: { status: 'approved' } });
    await AuditLog.create({ action: 'LOGIN', entity: 'User', entityId: admin._id, userId: admin._id, oldValue: null, newValue: { event: 'Admin logged in' } });

    console.log('Notifications and Audit logs created...');
    console.log('✅ Seed completed successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('  Admin:    admin@goalsync.com    / admin123');
    console.log('  Manager:  manager@goalsync.com  / manager123');
    console.log('  Employee: employee@goalsync.com / employee123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
