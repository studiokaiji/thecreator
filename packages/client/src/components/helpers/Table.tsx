import { Theme } from '@emotion/react';
import { SxProps } from '@mui/material';
import Paper from '@mui/material/Paper';
import MUITable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

type TableProps = {
  headRows: string[];
  data: (string | number)[][];
  sx?: SxProps<Theme>;
};

export const Table = ({ data, headRows, sx }: TableProps) => {
  return (
    <TableContainer component={Paper} sx={sx}>
      <MUITable>
        <TableHead>
          <TableRow>
            {headRows.map((row, i) => (
              <TableCell key={`table-head-row-${i}`}>{row}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, i) => (
            <TableRow
              key={`table-body-row-${i}`}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              {row.map((val, j) => (
                <TableCell key={`table-body-row-val-${j}`}>{val}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </MUITable>
    </TableContainer>
  );
};
