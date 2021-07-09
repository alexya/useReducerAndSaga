import React from "react";
import ReactDOM from "react-dom";
import { useReducerAndSaga } from "./useReducerAndSaga";
import { take, call, put, race, delay, select } from "redux-saga/effects";

import "./styles.css";

function reducer(state, action) {
  console.log("reducer", action);
  switch (action.type) {
    case "MY_INC":
      return { ...state, myCount: action.payload };
    case "INC":
      const amount = action.amount == null ? 1 : action.amount;
      return { ...state, count: state.count + amount };
    case "DEC":
      const amount2 = action.amount == null ? 1 : action.amount;
      return { ...state, count: state.count - amount2 };
    case "RESET_COUNTDOWN":
      return { ...state, countdown: action.countdown };
    case "DEC_COUNTDOWN":
      return { ...state, countdown: state.countdown - 1 };
    case "CANCEL_COUNTDOWN":
      return { ...state, countdown: 0 };
    default:
      return state;
  }
}

const getCountdown = state => state.countdown;
const getCount = state => state.count;

function* incLater() {
  let countdown = yield select(getCountdown);
  //console.log(countdown);
  while (countdown > 0) {
    yield delay(1000);
    yield put({ type: "DEC_COUNTDOWN" });
    countdown = yield select(getCountdown);
    //console.log(countdown);
  }

  yield put({ type: "INC" });
}

function* saga() {
  for (let i = 0; i < 5; i++) {
    yield put({ type: "MY_INC", payload: i * 101 });

    console.log("select", i, "=", yield select(state => state.myCount));
  }
  while (true) {
    const action = yield take("RESET_COUNTDOWN");
    yield race([call(incLater, action), take(["CANCEL_COUNTDOWN"])]);
  }
}

function App() {
  const [{ count, countdown }, dispatch] = useReducerAndSaga(
    reducer,
    { count: 0, countdown: 0, myCount: 0 },
    saga
  );

  const incInProgress = countdown > 0;

  function handleIncLaterClicked() {
    if (incInProgress) {
      dispatch({ type: "CANCEL_COUNTDOWN" });
    } else {
      dispatch({ type: "RESET_COUNTDOWN", countdown: 5 });
    }
  }

  return (
    <div className="App">
      <h2>Using Redux-saga with hooks **EXPERIMENTAL**</h2>
      <hr />
      <h2>Current count : {count}</h2>

      <button onClick={() => dispatch({ type: "DEC" })}>Decrement</button>
      <button onClick={() => dispatch({ type: "INC" })}>Increment</button>
      <button onClick={handleIncLaterClicked}>
        {incInProgress ? "Cancel future increment" : "Increment after 5s"}
      </button>
      <hr />
      <div style={{ display: incInProgress ? "block" : "none" }}>
        {`Will increment after ${countdown}s ...`}
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <App />,

  rootElement
);
