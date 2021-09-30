const R = require("ramda");
export default class Utils {
  //是否为null
  static isEmpty(str) {
    return R.isEmpty(str);
  }
}
