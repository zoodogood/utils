export function create_default_preventable() {
  let is_prevented = false;
  const default_prevented = () => is_prevented;
  const prevent_default = () => {
    is_prevented = true;
  };
  return { default_prevented, prevent_default };
}
