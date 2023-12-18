class BasePartialEnum<T> {
  static from(data: object) {
    return Object.assign(Object.create(this.prototype), data);
  }

  get props(): T {
    return this.props;
  }

  includes() {
    
  }s

  some(props: T) {
    return typeof props === "object" ? deepEqual(this.props, props) : this.props === props;
  }
}

class Ok<T> extends BasePartialEnum<T> {
  toBoolean() {
    return true;
  }
}

class Err<T> extends BasePartialEnum<T> {
  toBoolean() {
    return false;
  }
}
class Result<T> {
  static Ok(props: object) {
    return Ok.from({ props });
  }

  static Err(props: object) {
    return Err.from({ props });
  }

  static StatusNotExists = 1;
  static StatusReady = 2;
  static StatusInProcess = 3;
}
