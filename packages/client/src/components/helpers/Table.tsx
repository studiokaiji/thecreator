import { Theme } from '@emotion/react';
import { SxProps } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import MUITable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ReactNode } from 'react';

export type TableProps = {
  headRows: ReactNode[];
  data: ReactNode[][];
  sx?: SxProps<Theme>;
  elevation?: number;
  loading?: boolean;
};

export const Table = ({
  data,
  elevation,
  headRows,
  loading,
  sx,
}: TableProps) => {
  return (
    <TableContainer component={Paper} elevation={elevation} sx={sx}>
      <MUITable>
        {loading ? (
          <Stack alignItems="center" justifyContent="center">
            <CircularProgress sx={{ mb: 4, mt: 2, mx: 'auto' }} />
          </Stack>
        ) : (
          <>
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
          </>
        )}
      </MUITable>
    </TableContainer>
  );
};
