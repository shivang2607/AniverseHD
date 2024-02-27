import React from "react";
import { Card, Text, Container } from "@nextui-org/react";
import styles from "../styles/Animecardquery.module.css";

const Moviecardquery = (props) => {
  return (
    <Container display="flex">
      <Card
        css={{ w: "200px", h: "250px", m: "0.2rem 0rem" }}
        className={styles.qrycard}
      >
        <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
          {/* <Col>
        <Text size={12} weight="bold" transform="uppercase" color="#ffffffAA">
          New
        </Text>
        <Text h3 color="black">
          Acme camera
        </Text>
      </Col> */}
        </Card.Header>
        <Card.Body css={{ p: 0 }}>
          <Card.Image
            src={`https://image.tmdb.org/t/p/original${props.item.poster_path}`}
            width="100%"
            height="100%"
            objectFit="cover"
            alt="Movie background"
            // quality={50}
          />
        </Card.Body>
        <Card.Footer
          isBlurred
          css={{
            position: "absolute",
            bgBlur: "#ffffff66",
            borderTop: "$borderWeights$light solid rgba(255, 255, 255, 0.2)",
            bottom: 0,
            zIndex: 1,
          }}
        >
          {/* <Row> */}
          {/* <Col> */}
          <Text b color=" #442754  " size={20}>
            {props.item.title}
          </Text>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default Moviecardquery;
