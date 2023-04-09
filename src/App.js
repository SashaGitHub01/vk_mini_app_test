import React, { useState, useEffect, useRef } from "react";
import bridge from "@vkontakte/vk-bridge";
import {
  View,
  ScreenSpinner,
  AdaptivityProvider,
  AppRoot,
  ConfigProvider,
  SplitLayout,
  SplitCol,
} from "@vkontakte/vkui";
import "@vkontakte/vkui/dist/vkui.css";
import axios from "axios";

import Home from "./panels/Home";
import Persik from "./panels/Persik";

const GROUP_ID = 219858734;
const APP_ID = 51608859;
const KEY =
  "vk1.a.2OrtuSLSQhjJHI3Pr5D8aWTCPooX6BQZoiuJFFy2wbnrRJTGhZx4cSMRM639oLECLyN5FOh7gNbjQN58_7jrBIWyQ15g4YBRAn9j3xaThuqtJI2B2Fq-ezPwmUKu3_hb_28hS4Vm8tBk8-11ITT2BYHStKz5Avz5PHmQOTfMDw-vUHXRanvlRk69mzsgziUACWVbyjzIMGot1np59iepiA";

const sendMessage = async () => {
  await bridge.send("VKWebAppAllowMessagesFromGroup", {
    group_id: GROUP_ID,
    key: "3242",
    request_id: "1344",
  });

  const data = await bridge.send("VKWebAppCallAPIMethod", {
    method: "messages.send",
    params: {
      v: "5.131",
      access_token: KEY,
      message: "TEST",
      user_id: 345872941,
      peer_id: APP_ID,
      random_id: Math.random(),
    },
  });

  return data;
};

const App = () => {
  const [activePanel, setActivePanel] = useState("home");
  const [fetchedUser, setUser] = useState(null);
  const [popout, setPopout] = useState(<ScreenSpinner size="large" />);
  const [ts, setTs] = useState(null);

  const pollRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      const user = await bridge.send("VKWebAppGetUserInfo");
      setUser(user);
      setPopout(null);
    }
    fetchData();

    bridge
      .send("VKWebAppCallAPIMethod", {
        method: "messages.getHistory",
        params: {
          v: "5.131",
          access_token: KEY,
          user_id: 345872941,
          group_id: GROUP_ID,
          offset: 0,
          count: 10,
          extended: true,
        },
      })
      .then((data) => console.log({ data }));
  }, []);

  useEffect(() => {
    if (!pollRef.current) {
      bridge
        .send("VKWebAppCallAPIMethod", {
          method: "messages.getLongPollServer",
          params: {
            v: "5.131",
            access_token: KEY,
            group_id: GROUP_ID,
          },
        })
        .then((serv) => (pollRef.current = serv));
    } else {
      axios.get();
    }
  }, []);

  const go = (e) => {
    setActivePanel(e.currentTarget.dataset.to);
  };

  return (
    <ConfigProvider>
      <AdaptivityProvider>
        <AppRoot>
          <SplitLayout popout={popout}>
            <SplitCol>
              <View activePanel={activePanel}>
                <Home
                  sendMessage={sendMessage}
                  id="home"
                  fetchedUser={fetchedUser}
                  go={go}
                />
                <Persik id="persik" go={go} />
              </View>
            </SplitCol>
          </SplitLayout>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};

export default App;
