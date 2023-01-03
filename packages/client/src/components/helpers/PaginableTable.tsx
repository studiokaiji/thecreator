import Paper from '@mui/material/Paper';
import TablePagination, {
  TablePaginationProps,
} from '@mui/material/TablePagination';

import { Table, TableProps } from './Table';

type PaginableTableProps = TableProps & {
  paging: Omit<TablePaginationProps, 'rowsPerPage' | 'component'>;
};

export const PaginableTable = ({
  data,
  elevation,
  headRows,
  paging,
  sx,
}: PaginableTableProps) => {
  return (
    <Paper elevation={elevation} sx={sx}>
      <Table
        data={data}
        elevation={0}
        headRows={headRows}
        sx={(theme) => {
          return {
            borderBottom: '1px solid',
            borderColor: (theme as any).palette.divider,
            borderRadius: 0,
          };
        }}
      />
      <TablePagination {...paging} component="div" rowsPerPage={data.length} />
    </Paper>
  );
};
