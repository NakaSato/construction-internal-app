import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    IconButton,
    Typography,
    useTheme,
} from "@mui/material";
import { X } from "lucide-react";
import { CreateMilestoneRequest } from "@shared/utils/masterPlansApi";

interface MilestoneDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (milestone: CreateMilestoneRequest) => void;
    loading?: boolean;
}

const MilestoneDialog = ({ open, onClose, onSave, loading = false }: MilestoneDialogProps) => {
    const theme = useTheme();
    const [milestoneName, setMilestoneName] = useState("");
    const [description, setDescription] = useState("");
    const [targetDate, setTargetDate] = useState("");

    const handleSave = () => {
        if (!milestoneName.trim() || !targetDate) return;

        onSave({
            milestoneName: milestoneName.trim(),
            description: description.trim() || undefined,
            targetDate: new Date(targetDate).toISOString(),
        });

        // Reset form
        setMilestoneName("");
        setDescription("");
        setTargetDate("");
    };

    const handleClose = () => {
        setMilestoneName("");
        setDescription("");
        setTargetDate("");
        onClose();
    };

    const isValid = milestoneName.trim() && targetDate;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: { sx: { borderRadius: 2 } }
            }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
                <Typography component="span" variant="h6" sx={{ fontWeight: "bold" }}>
                    Add Milestone
                </Typography>
                <IconButton size="small" onClick={handleClose}>
                    <X size={20} />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    <TextField
                        label="Milestone Name"
                        placeholder="e.g., Site Survey Complete"
                        value={milestoneName}
                        onChange={(e) => setMilestoneName(e.target.value)}
                        fullWidth
                        required
                        autoFocus
                    />
                    <TextField
                        label="Description"
                        placeholder="Optional description of the milestone"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                    />
                    <TextField
                        label="Target Date"
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        fullWidth
                        required
                        slotProps={{
                            inputLabel: { shrink: true }
                        }}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!isValid || loading}
                >
                    {loading ? "Saving..." : "Add Milestone"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MilestoneDialog;
