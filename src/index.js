const STEP = '@@transducer/step';
const RESULT = '@@transducer/result';

function identity(t) {
  return t;
}

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
