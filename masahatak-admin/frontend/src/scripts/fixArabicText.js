const fs = require('fs');
const path = require('path');

// Map of Arabic text to translation keys
const replacements = {
  // Users page
  'إدارة المستخدمين': "t('users.title')",
  'إدارة ومراقبة جميع المستخدمين المسجلين': "t('users.subtitle')",
  'إضافة مستخدم': "t('users.addUser')",
  'جميع المستخدمين': "t('users.allUsers')",
  'الاسم الكامل': "t('users.fullName')",
  'البريد الإلكتروني': "t('users.email')",
  'الهاتف': "t('users.phone')",
  'تاريخ الانضمام': "t('users.joinedDate')",
  'رقم الهاتف': "t('users.phoneNumber')",
  'كلمة المرور': "t('users.password')",
  'موقوف': "t('users.suspended')",
  'إنشاء مستخدم جديد': "t('users.createUser')",
  'تفاصيل المستخدم': "t('users.userDetails')",
  'إيقاف المستخدم': "t('users.suspendUser')",
  'تفعيل المستخدم': "t('users.activateUser')",
  'حذف المستخدم': "t('users.deleteUser')",
  'سبب الإيقاف': "t('users.suspensionReason')",
  'سبب الحذف': "t('users.deletionReason')",

  // Owners page
  'إدارة الملاك': "t('owners.title')",
  'إدارة ومراقبة ملاك مساحات العمل': "t('owners.subtitle')",
  'جميع الملاك': "t('owners.allOwners')",
  'اسم العمل': "t('owners.businessName')",
  'البريد الإلكتروني للتواصل': "t('owners.contactEmail')",
  'هاتف التواصل': "t('owners.contactPhone')",
  'عدد المساحات': "t('owners.spacesCount')",
  'تفاصيل المالك': "t('owners.ownerDetails')",
  'الملف الشخصي': "t('owners.profile')",
  'المساحات': "t('owners.spaces')",
  'الحجوزات': "t('owners.bookings')",
  'عرض التفاصيل': "t('common.viewDetails')",

  // Workspaces page
  'إدارة مساحات العمل': "t('workspaces.title')",
  'مراجعة وإدارة قوائم مساحات العمل': "t('workspaces.subtitle')",
  'تصفية الحالة': "t('workspaces.filterStatus')",
  'جميع المساحات': "t('workspaces.allSpaces')",
  'اسم المساحة': "t('workspaces.spaceName')",
  'الموقع': "t('workspaces.location')",
  'النوع': "t('workspaces.type')",
  'السعة': "t('workspaces.capacity')",
  'السعر/ساعة': "t('workspaces.pricePerHour')",
  'الموافقة': "t('workspaces.approve')",
  'الرفض': "t('workspaces.reject')",
  'تفاصيل مساحة العمل': "t('workspaces.workspaceDetails')",
  'المالك': "t('workspaces.owner')",
  'نوع المساحة': "t('workspaces.spaceType')",
  'السعر لكل ساعة': "t('workspaces.pricePerHourLabel')",
  'المرافق': "t('workspaces.amenities')",
  'الحجوزات الأخيرة': "t('workspaces.recentBookings')",
  'سبب الرفض': "t('workspaces.rejectionReason')",
  'سبب الحذف': "t('workspaces.deletionReason')",
  'تم الرفض بواسطة': "t('workspaces.rejectedBy')",
  'تاريخ الرفض': "t('workspaces.rejectedDate')",
  'تم الحذف بواسطة': "t('workspaces.deletedBy')",
  'تاريخ الحذف': "t('workspaces.deletedDate')",
  'حذف مساحة العمل': "t('workspaces.deleteWorkspace')",
  'الموافقة على مساحة العمل': "t('workspaces.approveWorkspace')",
  'رفض مساحة العمل': "t('workspaces.rejectWorkspace')",

  // Common
  'الحالة': "t('common.status')",
  'الإجراءات': "t('common.actions')",
  'نشط': "t('common.active')",
  'محذوف': "t('common.deleted')",
  'قيد الانتظار': "t('common.pending')",
  'بانتظار الموافقة': "t('common.pendingApproval')",
  'مرفوض': "t('common.rejected')",
  'إلغاء': "t('common.cancel')",
  'تأكيد': "t('common.confirm')",
  'إغلاق': "t('common.close')",
  'حذف': "t('common.delete')",
  'إنشاء': "t('common.create')",
  'غير متوفر': "t('common.notAvailable')",
  'جاري التحميل...': "t('common.loading')",
  'لم يتم العثور على مساحات عمل': "t('workspaces.noWorkspaces')",
  'لم يتم العثور على مستخدمين': "t('users.noUsers')",
  'شخص': "t('common.person')",
  'حجز': "t('common.booking')"
};

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace each Arabic text with translation key
    // Use a more careful approach to avoid replacing inside strings incorrectly
    for (const [arabic, translationKey] of Object.entries(replacements)) {
      // Match the Arabic text when it's used as a string literal or JSX content
      const patterns = [
        // JSX content: >Arabic text<
        new RegExp(`>\\s*${arabic}\\s*<`, 'g'),
        // String literal: 'Arabic text' or "Arabic text"
        new RegExp(`['"]${arabic}['"]`, 'g'),
        // JSX string prop: prop="Arabic text" or prop='Arabic text'
        new RegExp(`=\\s*['"]${arabic}['"]`, 'g'),
      ];

      for (const pattern of patterns) {
        if (pattern.test(content)) {
          if (pattern.source.includes('>')) {
            // JSX content
            content = content.replace(pattern, `>{${translationKey}}<`);
          } else if (pattern.source.includes('=')) {
            // Prop value
            content = content.replace(pattern, `={${translationKey}}`);
          } else {
            // String literal
            content = content.replace(pattern, translationKey);
          }
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`  No changes needed: ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Process the three pages
const pagesDir = path.join(__dirname, '..');
const files = [
  path.join(pagesDir, 'pages', 'Users.js'),
  path.join(pagesDir, 'pages', 'Owners.js'),
  path.join(pagesDir, 'pages', 'Workspaces.js')
];

console.log('Starting Arabic text replacement...\n');

let totalUpdated = 0;
files.forEach(file => {
  if (replaceInFile(file)) {
    totalUpdated++;
  }
});

console.log(`\nCompleted! ${totalUpdated} file(s) updated.`);
