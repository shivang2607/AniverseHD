import React, { useState } from "react";
import dynamic from "next/dynamic";
import styles from "@/styles/Resultcard.module.css";
import {
  Modal,
  Card,
  Row,
  Col,
  Text,
  Container,
  Badge,
  Tooltip,
} from "@nextui-org/react";
import { BsFillInfoCircleFill } from "react-icons/bs";
// import Animemodal from './animemodal';
const Moviemodal = dynamic(() => import("./Moviemodal"), {
  ssr: false,
});

const Movieresultcard = ({ detail }) => {
  const [visible, setVisible] = useState(false);
  const closeHandler = () => {
    setVisible(false);
    //console.log("closed");
  };

  return (
    <div style={{ display: "block", margin: "1rem" }}>
      <Card
        isPressable
        onPress={() => setVisible(true)}
        className={styles.card}
      >
        <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
          <Col>
            {/* <Text h3 color="white">
          {detail.English}
        </Text> */}
          </Col>
        </Card.Header>
        <Card.Body css={{ p: 0 }}>
          <Card.Image
            src={`https://image.tmdb.org/t/p/w300${detail.poster_path}`}
            objectFit="cover"
            width="100%"
            height="100%"
            alt="Relaxing app background"
          />
        </Card.Body>

        <Card.Footer css={{ justifyItems: "flex-start", p: "0.5rem 01rem" }}>
          <Row justify="space-between" align="center">
            <Text css={{ marginRight: " 1rem" }} color=" #c2b9c4 " b size={18}>
              {detail.title}
            </Text>

            <Text
              css={{
                color: "$accents7",
                fontWeight: "$semibold",
                fontSize: "$sm",
              }}
            >
              {detail.release_date.substr(0, 4)}
            </Text>
          </Row>
        </Card.Footer>

        <Card.Footer className={styles.footer2}>
          <Col css={{ m: "0.5rem 0 " }}>
            <div>
              {detail.genres.split("-").map((gen, i) => {
                if (gen !== "Unknown")
                  return (
                    <Badge
                      className={styles.badges}
                      key={i}
                      size="sm"
                      enableShadow
                      isSquared
                      color="secondary"
                      variant="flat"
                    >
                      {gen}
                    </Badge>
                  );
              })}
            </div>
            <Container
              css={{
                display: "flex",
                justifyContent: "space-between",
                m: "0.2rem 0 0.5rem",
              }}
            >
              <Text
                color=" #c2b9c4 "
                b
                size={12}
                css={{ justifyItems: "flex-end", m: "0.2rem 0 0.5rem" }}
              >
                <Tooltip
                  shadow
                  bordered
                  // size={12}
                  css={{ width: "200px" }}
                  content={
                    "Ranges from 0 to 1, lesser the value greater the similarity ! "
                  }
                  trigger="hover"
                  color="secondary"
                  enterDelay={200}
                  leaveDelay={500}
                  offset={6}
                >
                  <BsFillInfoCircleFill color="pink" />
                  &nbsp;Distance:&nbsp;
                  {Math.round(detail.Distances * 100) / 100}
                </Tooltip>
              </Text>

              <Text
                color=" #c2b9c4 "
                b
                size={12}
                css={{ justifyItems: "flex-end", m: "0.2rem 0 0.5rem" }}
              >
                Runtime:&nbsp;{detail.runtime} min
              </Text>
            </Container>
          </Col>
        </Card.Footer>
      </Card>

      <Modal
        closeButton
        // fullScreen={true}
        // noPadding
        // preventClose
        width="1350px"
        // height='1000px'
        blur
        css={{ width: "1350px", height: "600px", justifyContent: "center" }}
        aria-labelledby="modal-title"
        open={visible}
        // className={styles.modal}
        onClose={closeHandler}
      >
        <Modal.Body>
          <Moviemodal detail={detail} />
        </Modal.Body>
        {/* <Modal.Footer>
      <Button auto flat color="error" onPress={closeHandler}>
        Close
      </Button>
      <Button auto onPress={closeHandler}>
        Sign in
      </Button>
    </Modal.Footer> */}
          
      </Modal>
    </div>
  );
};

export default Movieresultcard;
