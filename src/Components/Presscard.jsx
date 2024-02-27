import React from "react";
import { Card, Col, Text } from "@nextui-org/react";
import styles from "@/styles/Home.module.css";
import Link from "next/link";

const Presscard = (props) => {
  return (
    <div className={styles.pressdiv}>
      <Link href={props.link}>
        <Card
          isPressable
          css={{
            w: "90%",
            h: "450px",
            m: "2rem",
            backgroundColor: "rgba(0,0,0,0.5)",
            "@md": {
              padding: "0rem",
            },
          }}
        >
          <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
            <Col>
              <Text size={15} weight="bold" color="#ffffffAA">
                Click for
              </Text>
              <Text h3 color="white">
                {props.content}
              </Text>
            </Col>
          </Card.Header>
          <Card.Image
            src={props.src}
            objectFit="cover"
            width="100%"
            height={500}
            alt="Card image background"
          />
        </Card>
      </Link>
    </div>
  );
};

export default Presscard;
