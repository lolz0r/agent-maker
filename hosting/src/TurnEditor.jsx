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

function TurnEditor({ dataKey }) {
  const [examples, setExamples] = store.useState(dataKey);

  return (
    <Box p="10px">
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
                  <Select placeholder="Turn Type" value={turn.type}>
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
                    primer="Complete the following message within a observation-thought-action chain:"
                  ></ConinuationBox>
                </GridItem>
              </>
            );
          })}
      </Grid>
    </Box>
  );
}

export default TurnEditor;
