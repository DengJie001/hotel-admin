/**
 * 路由权限
 */
export default function access(initialState: { currentUser?: UserInfo.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  return {
    // canAdmin: currentUser && currentUser.canVisit,
    canVisit: (route: any) => currentUser && currentUser.canVisit?.includes(route.path)
  };
}
