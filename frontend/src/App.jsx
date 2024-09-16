import { Container, Stack, Text } from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import UserGrid from "./components/UserGrid";
import { useState, useEffect, useCallback } from "react";
import liff from "@line/liff";

// updated this after recording. Make sure you do the same so that it can work in production
export const BASE_URL =
  import.meta.env.MODE === "development" ? "http://127.0.0.1:5000/api" : "/api";
const LIFF_ID = "2006328893-maZxZg49"

function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const initializeLiff = useCallback(async () => {
    try {
      await liff.init({
        liffId: LIFF_ID, // ご自身のliff IDを使用して下さい
        withLoginOnExternalBrowser: true, // 外部ブラウザでも使用できるようにします
      });
      if (!liff.isLoggedIn()) {
        console.log("ログインしていません");
        liff.login({ redirectUri: `https://miniapp.line.me/${LIFF_ID}` });
        console.log("ログインしました");
      } else {
        console.log("既にログインしています");
      }

    } catch (error) {
      console.error("LIFFの初期化に失敗しました", error);
    }
  }, []);



  const initializeCurrentUser = useCallback(async () => {
    const idToken = liff.getIDToken();
    if (!idToken) {
      console.error("ID Token is null or undefined");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });
      const profile = await response.json();
      if (profile.sub) {
        setCurrentUser({
          userId: profile.sub,
          displayName: profile.name,
          pictureUrl: profile.picture,
        });
      }
    } catch (error) {
      console.error("Failed to get user info", error);
    }
  }, []);

  useEffect(() => {
	const init = async () => {
		await initializeLiff();
		if (liff.isLoggedIn()) {
			await initializeCurrentUser();
		} else {
			console.error("liff is not logged in");
		}
	};
	init();
}, []); 

  return (
    <Stack minH={"100vh"}>
      <Navbar setUsers={setUsers} currentUser={currentUser}/>

      <Container maxW={"1200px"} my={4}>
        <Text
          fontSize={{ base: "3xl", md: "50" }}
          fontWeight={"bold"}
          letterSpacing={"2px"}
          textTransform={"uppercase"}
          textAlign={"center"}
          mb={8}
        >
          <Text
            as={"span"}
            bgGradient={"linear(to-r, cyan.400, blue.500)"}
            bgClip={"text"}
          >
            My Besties
          </Text>
          🚀
        </Text>

        <UserGrid users={users} setUsers={setUsers} currentUser={currentUser}/>
      </Container>
    </Stack>
  );
}

export default App;
