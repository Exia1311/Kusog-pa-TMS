import {z} from 'zod'
export const BARCODE_RE=/^[A-Z0-9-]{4,50}$/  // ADJUST to the mill's real format (also in DB check)
export const ticketSchema=z.object({
  barcode_number:z.string().trim().toUpperCase().regex(BARCODE_RE,'Barcode must be 4-50 characters: A-Z, 0-9, hyphen'),
  is_manual_planter:z.boolean(),
  planter_code:z.string().trim().min(1,'Planter code required').max(50),planter_name:z.string().trim().min(1,'Planter name required'),
  hda_code:z.string().trim().max(50).optional().transform(v => (v ?? '').trim()),
  hda_name:z.string().trim().min(1,'HDA name required'),
  association:z.string().trim().min(1,'Association required'),
  cane_variety:z.string().trim().optional(),driver_name:z.string().trim().optional(),
  truck_plate_no:z.string().trim().max(20).optional(),fc_bc:z.string().trim().max(50).optional(),bucket_board_no:z.string().trim().max(50).optional()})
