import React, { useState } from "react";
import styles from "../styles/Resultcard.module.css";
import {
  Card,
  Row,
  Col,
  Text,
  Container,
  Badge,
  Tooltip,
} from "@nextui-org/react";
import { BsFillInfoCircleFill } from "react-icons/bs";
import Link from "next/link";


const Mangaresultcard = ({ detail }) => {
  const [visible, setVisible] = useState(false);
  const closeHandler = () => {
    setVisible(false);
    // console.log("closed");
  };

  //       React.useEffect(()=>{
  // console.log(detail);
  // },[])

  const handleOnClick = () => {};

  return (
    <Link legacyBehavior href={`/MangaSeries/${detail.manga_id}`} passHref>
      <a target="_blank" rel="noopener noreferrer">
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
              src={detail.main_picture}
              objectFit="cover"
              width="100%"
              height="100%"
              alt="Anime Poster"
              quality={100}
              unoptimised={true}
            />
          </Card.Body>

          <Card.Footer css={{ justifyItems: "flex-start", p: "0.5rem 01rem" }}>
            <Row justify="space-between" align="center">
              <Text
                css={{ marginRight: " 1rem" }}
                color=" #c2b9c4 "
                b
                size={18}
              >
                {detail.title_english ? detail.title_english : detail.title}
              </Text>

              <Text
                css={{
                  color: "$accents7",
                  fontWeight: "$semibold",
                  fontSize: "$sm",
                }}
              >
                {detail.type}
              </Text>
            </Row>
          </Card.Footer>

          <Card.Footer className={styles.footer2}>
            <Col css={{ m: "0.5rem 0 " }}>
              <div>
                {detail.genres.map((gen, i) => {
                  if (gen !== "Unknown")
                    return (
                      <Badge
                        key={i}
                        size="sm"
                        css={{ margin: "0.1rem 0.2rem" }}
                        enableShadow
                        isSquared
                        color="secondary"
                        variant="flat"
                      >
                        {gen}
                      </Badge>
                    );
                })}
                {detail.themes.map((gen, i) => {
                  if (gen !== "Unknown")
                    return (
                      <Badge
                        key={i}
                        size="sm"
                        css={{ margin: "0.1rem 0.2rem" }}
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
                  chapters:&nbsp;{detail.chapters}
                </Text>
              </Container>
            </Col>
          </Card.Footer>
        </Card>

        {/* <Modal
    closeButton
    // noPadding
    // preventClose
    width='1350px'
    // height='1000px'
    blur
    css={{width:"1350px" , height:"600px", justifyContent:"center"}}
    aria-labelledby="modal-title"
    open={visible}
    onClose={closeHandler}
  >
    
    <Modal.Body>

    <Mangamodal detail={detail}/>
      
    </Modal.Body>
  </Modal> */}
      </a>
    </Link>
  );
};

export default Mangaresultcard;
