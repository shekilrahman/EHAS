const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os'); // Add OS module
const Printer = require('../model/Printer');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const printerName = req.body.printer || 'default';

    const tempDir = os.tmpdir();
    const timestamp = Date.now();
    const tempFilePath = path.join(tempDir, `${timestamp}.pdf`);

    fs.writeFileSync(tempFilePath, req.file.buffer);

    let printCommand;
    switch (process.platform) {
        case 'win32':
            printCommand = `powershell -Command "$process = Start-Process -FilePath '${tempFilePath}' -Verb PrintTo -ArgumentList '${printerName}' -WindowStyle Hidden -PassThru; $process.WaitForExit()"`;
            break;
        case 'darwin':
            printCommand = `lpr -P ${printerName} ${tempFilePath}`;
            break;
        case 'linux':
            printCommand = `lp -d ${printerName} ${tempFilePath}`;
            break;
        default:
            fs.unlink(tempFilePath, (err) => {
                if (err) console.error(`Failed to delete temporary file: ${err.message}`);
            });
            return res.status(500).json({ message: 'Unsupported OS.' });
    }

    exec(printCommand, { windowsHide: true }, (error, stdout, stderr) => {
        fs.unlink(tempFilePath, (err) => {
            if (err) console.error(`Failed to delete temporary file: ${err.message}`);
        });

        if (error) {
            console.error(`Print job failed: ${error.message}`);
            return res.status(500).json({ message: 'Print job failed.', error: error.message });
        }
        if (stderr) {
            console.error(`Print job error: ${stderr}`);
            return res.status(500).json({ message: 'Print job error.', error: stderr });
        }

        console.log(`Print job sent: ${stdout}`);
        res.status(200).json({ message: `${stdout}` });
    });
});
// ... rest of the routes remain unchanged

router.post("/set/", async (req, res) => {
    try {
        const { printer_name, printer_type } = req.body;

        if (!printer_name || !printer_type) {
            return res.status(400).json({ message: "Printer name and type are required." });
        }

        // Find an existing printer by type and update it
        const updatedPrinter = await Printer.findOneAndUpdate(
            { printer_type }, // Search by type
            { printer_name }, // Update name
            { new: true, upsert: true } // Create if not exists
        );

        res.status(201).json(updatedPrinter);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


  router.get('/get/:type', async (req, res) => {
    try {
      const { type } = req.params; // Extract type from URL parameter
  
      const printers = await Printer.find({ printer_type: type });
  
      if (printers.length === 0) {
        return res.status(404).json({ message: 'No printers found for this type.' });
      }
  
      res.status(200).json(printers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
module.exports = router;