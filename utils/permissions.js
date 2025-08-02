module.exports = function checkPermission(member, requiredRoleName) {
  const roles = member.roles.cache.map(role => role);
  const requiredIndex = roles.findIndex(role => role.name === requiredRoleName);

  if (requiredIndex === -1) return false;

  // Allow if member has that role or any role higher in the hierarchy
  return roles.some(role => role.position >= roles[requiredIndex].position);
};
