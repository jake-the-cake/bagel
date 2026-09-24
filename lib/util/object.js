function hasAllProps(object, ...props) {
  return props.every((prop) => object[prop]);
}

export default { hasAllProps };
