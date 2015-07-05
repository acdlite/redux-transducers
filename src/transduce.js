import identity from './identity';
import { STEP, RESULT } from './constants';

export default function transduce(xform, reducer = identity) {
  return (state, action) => {
    const transducer = xform({
      [STEP]: reducer,
      [RESULT]: identity
    });
    const result = transducer[STEP](state, action);
    return transducer[RESULT](result);
  };
}
