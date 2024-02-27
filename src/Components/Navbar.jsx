import React from "react";
import { useRouter } from "next/router";
import {
  Navbar,
  Link,
  Text,
  Avatar,
  Dropdown,
  useTheme,
  Button,
  purple,
} from "@nextui-org/react";
//import { Layout } from "./Layout.js";
//import { AcmeLogo } from "./AcmeLogo.js";

//import {db, auth} from "../firebase/firebaseinit"
import { useFirebase } from "../context/firebaseContext";
import styles from "../styles/Navbar.module.css"

import Image from "next/image";

const Bar = () => {
  const [variant, setVariant] = React.useState("default");
  const [activeColor, setActiveColor] = React.useState("primary");
  const { signIn, signout, auth, getUserCookies } = useFirebase();
  const { isDark } = useTheme();
  const [user, setUser] = React.useState(null);
  const router = useRouter();
  
  React.useEffect(() => {
    const useData = getUserCookies();
    setUser(useData.details);
    //console.log("current", auth)
    // const listener = onAuthStateChanged(auth, async (user) => {
    //  // console.log(user);

    // });

    // return () => {
    //   listener();
    // };
  }, []);

  const variants = [
    "default",
    "highlight",
    "highlight-solid",
    "underline",
    "highlight-rounded",
    "highlight-solid-rounded",
    "underline-rounded",
  ];

  const collapseItems = ["Home", "Anime", "Manga","About"];

  const colors = ["primary", "secondary", "success", "warning", "error"];
  return (
    <Navbar    
     height={80}   
     variant="sticky"
    >
      <Navbar.Toggle showIn="xs" />
      <Navbar.Brand
        css={{
          "@xs": {
            w: "12%",
          },
        }}
      >
        <Navbar.Content activeColor={activeColor} variant={variant}>
          <Navbar.Link href="/">
            <Image src="/logo1.png" width={200} height={50} alt="NA" />
            {/* <Text b color="inherit" size={25} style={{textDecoration:"underline"}}>
            ANIMOVIX
          </Text> */}
          </Navbar.Link>
        </Navbar.Content>
      </Navbar.Brand>

      <Navbar.Content
        enableCursorHighlight
        activeColor="secondary"
        hideIn="xs"
        variant="highlight-rounded"
      >
        
        <Navbar.Link onPress={()=>{
          router.push("/")
        }}  >
        <Text size={20} css={{letterSpacing:"1px"}} className={router.route==="/"?styles.active:""}> Home </Text>
        </Navbar.Link>
        <Navbar.Link onPress={()=>{
          router.push("/Anime")
        }}  >
          <Text size={20} css={{letterSpacing:"1px"}} className={router.route==="/Anime"?styles.active:""}> Anime</Text>
        </Navbar.Link>
        <Navbar.Link onPress={()=>{
          router.push("/Manga")
        }}  >
          <Text size={20} css={{letterSpacing:"1px"}} className={router.route==="/Manga"?styles.active:""}>Manga</Text>
        </Navbar.Link>
        <Navbar.Link onPress={()=>{
          router.push("/About")
        }} >
          <Text size={20} css={{letterSpacing:"1px"}} className={router.route==="/About"?styles.active:""}>About</Text>
        </Navbar.Link>
      </Navbar.Content>

      {user ? (
        <Navbar.Content
          css={{
            "@xs": {
              w: "12%",
              jc: "flex-end",
            },
          }}
        >
          <Dropdown placement="bottom-right">
            <Navbar.Item>
              <Dropdown.Trigger>
                <Avatar
                  bordered
                  as="button"
                  color="secondary"
                  size="md"
                  src={user.photo}
                  alt="N/A"
                />
              </Dropdown.Trigger>
            </Navbar.Item>
            <Dropdown.Menu
              aria-label="User menu actions"
              color="secondary"
              // onAction={(actionKey) => console.log({ actionKey })}
            >
              <Dropdown.Item key="profile" css={{ height: "$18" }}>
                <Text b color="inherit" css={{ d: "flex" }}>
                  Signed in as
                </Text>
                <Text b color="inherit" css={{ d: "flex" }}>
                  {user.name}
                </Text>
              </Dropdown.Item>

              <Dropdown.Item  key="settings" hideIn="xs" withDivider>
                <div onClick={()=>router.push("/Profile")}>Watch List</div>
              </Dropdown.Item>
              <Dropdown.Item key="help_and_feedback" withDivider>
              <div onClick={()=>router.push("/Feedback")}>Feedback</div>
              </Dropdown.Item>
              <Dropdown.Item key="logout" withDivider color="error" onClick={signout}>
                <button onClick={signout}  style={{background:"none", border:"none", width:"100%",textAlign:"left", cursor:"pointer"} }>Log Out</button>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Content>
      ) : (
        <Navbar.Content>
          <Navbar.Item>
            <Button auto flat as={Link} color={activeColor} onPress={signIn}>
              Sign In
            </Button>
          </Navbar.Item>
        </Navbar.Content>
      )}
      <Navbar.Collapse>
        {collapseItems.map((item, index) => (
          <Navbar.CollapseItem key={item}>
            <Link
              color="inherit"
              css={{
                minWidth: "100%",
              }}
              href={item == "Home" ? "/" : "/"+item}
            >
              {item}
            </Link>
          </Navbar.CollapseItem>
        ))}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Bar;
