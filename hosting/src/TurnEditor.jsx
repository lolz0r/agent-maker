import { useState, useRef, useEffect } from "react";
import {
  Box,
  Input,
  Spinner,
  IconButton,
  Text,
  Tooltip,
  Select,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import ConinuationBox from "./ContinuationBox";
import { store } from "./utils";
import { RiAddCircleFill } from "react-icons/ri";

function TurnEditor({ dataKey, title }) {
  const [examples, setExamples] = store.useState(dataKey);

  return (
    <Box p="10px">
      <Text fontWeight="bold">{title}</Text>

      <Grid templateColumns="auto 1fr" gap={"5px"}>
        {examples &&
          examples.map((turn, idx) => {
            return (
              <>
                <GridItem
                  key={idx + "turn"}
                  colStart="1"
                  colEnd="2"
                  rowStart={idx + 1}
                  rowEnd={idx + 2}
                  alignSelf="center"
                >
                  <Select
                    size="xs"
                    value={turn.type}
                    onChange={(e) => {
                      //e.target.value
                      let updatedExamples = [...examples];

                      updatedExamples[idx] = { ...turn, type: e.target.value };
                      setExamples(updatedExamples);
                    }}
                  >
                    <option value="observation">Observation</option>
                    <option value="thought">Thought</option>
                    <option value="action">Action</option>
                  </Select>
                </GridItem>
                <GridItem
                  key={idx + "message"}
                  colStart="2"
                  colEnd="3"
                  rowStart={idx + 1}
                  rowEnd={idx + 2}
                >
                  <ConinuationBox
                    dataKey={`${dataKey}.${idx}`}
                    primer={`Complete the following message of type ${turn.type} within a observation-thought-action chain:`}
                  ></ConinuationBox>
                </GridItem>
              </>
            );
          })}
        <GridItem colStart="1" colEnd="2">
          <IconButton
            colorScheme="blue"
            size="xs"
            icon={<RiAddCircleFill />}
            onClick={() => {
              //e.target.value
              let updatedExamples = [
                ...examples,
                { type: "observation", message: "" },
              ];
              setExamples(updatedExamples);
            }}
          ></IconButton>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default TurnEditor;
