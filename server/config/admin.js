
export const adminConfig = {
  adminEmails: [
    'trieukon1011@gmail.com',
    'it.mpclub@ou.edu.vn',
  ],
  
  defaultOrganization: 'ou.edu.vn',
  
  autoGrantAdmin: true,
  
  checkOrganizationDomain: true
};

export function isAdminEmail(email) {
  return adminConfig.adminEmails.includes(email.toLowerCase());
}

export function isSameOrganization(email, organizationDomain) {
  if (!organizationDomain) return true;
  const emailDomain = email.split('@')[1];
  return emailDomain === organizationDomain;
}
