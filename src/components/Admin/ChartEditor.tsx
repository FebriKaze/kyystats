import React, { useState, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, Legend 
} from 'recharts';
import { 
  Upload, FileSpreadsheet, Download, Share2, Copy, 
  BarChart3, Trash2, Plus, Settings, ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { showToast } from '../Common/Toast';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ChartEditorProps {
  onChartUpdate: (chartData: any) => void;
  initialData?: ChartData[];
}

const ChartEditor: React.FC<ChartEditorProps> = ({ onChartUpdate, initialData = [] }) => {
  const [chartData, setChartData] = useState<ChartData[]>(initialData);
  const [chartTitle, setChartTitle] = useState('Statistik Performa');
  const [dataSource, setDataSource] = useState<'upload' | 'manual'>('upload');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Single color for all bars
  const chartColor = '#8b5cf6';

  // Parse CSV file
  const parseCSV = (text: string): ChartData[] => {
    console.log('Raw CSV text:', text);
    
    const lines = text.split('\n').filter(line => line.trim());
    console.log('CSV lines:', lines);
    
    const data: ChartData[] = [];
    
    lines.forEach((line, index) => {
      // Skip header if it looks like a header
      if (index === 0 && (line.toLowerCase().includes('label') || line.toLowerCase().includes('value') || line.toLowerCase().includes('nama'))) {
        console.log('Skipping header line:', line);
        return;
      }
      
      // Handle both comma and semicolon separators
      const separator = line.includes(';') ? ';' : ',';
      const parts = line.split(separator);
      
      console.log('Parsing line:', line, 'Parts:', parts);
      
      if (parts.length >= 2) {
        const label = parts[0].trim().replace(/["']/g, '');
        let valueStr = parts[1].trim().replace(/["']/g, '');
        
        // Handle both decimal separators (comma and dot)
        // If value contains comma and dot, assume comma is thousands separator
        if (valueStr.includes(',') && valueStr.includes('.')) {
          valueStr = valueStr.replace(/,/g, '');
        } else if (valueStr.includes(',')) {
          // If only comma, treat as decimal separator
          valueStr = valueStr.replace(',', '.');
        }
        
        const value = parseFloat(valueStr);
        
        console.log('Parsed:', { label, value, originalValueStr: parts[1].trim(), processedValueStr: valueStr });
        
        if (label && !isNaN(value) && value !== null) {
          data.push({
            label,
            value,
            color: chartColor
          });
          console.log('Added data item:', { label, value });
        } else {
          console.log('Invalid data - label:', label, 'value:', value, 'isNaN:', isNaN(value));
        }
      } else {
        console.log('Not enough parts in line:', line);
      }
    });
    
    console.log('Final parsed data:', data);
    return data;
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);

    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(fileType)) {
      showToast('error', 'Format file tidak diduk. Upload CSV atau Excel.');
      return;
    }

    try {
      let data: ChartData[] = [];
      
      if (fileType === 'csv') {
        // Parse CSV file
        const text = await file.text();
        console.log('CSV text length:', text.length);
        data = parseCSV(text);
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        // Parse Excel file
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // Use first sheet
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log('Excel data:', jsonData);
        
        // Convert Excel data to ChartData format
        data = jsonData
          .slice(1) // Skip header row
          .filter((row: any) => row.length >= 2 && row[0] && row[1]) // Filter valid rows
          .map((row: any, index: number) => {
            const label = String(row[0]).trim();
            let valueStr = String(row[1]).trim();
            
            // Handle Excel decimal formatting
            if (valueStr.includes(',') && valueStr.includes('.')) {
              valueStr = valueStr.replace(/,/g, '');
            } else if (valueStr.includes(',')) {
              valueStr = valueStr.replace(',', '.');
            }
            
            const value = parseFloat(valueStr);
            
            console.log('Excel parsed:', { label, value, originalValue: row[1], processedValue: valueStr });
            
            if (label && !isNaN(value)) {
              return {
                label,
                value,
                color: chartColor
              };
            }
            return null;
          })
          .filter((item: ChartData | null): item is ChartData => item !== null);
      }
      
      if (data.length === 0) {
        showToast('warning', 'Tidak ada data yang valid ditemukan di file. Periksa format file Anda.');
        console.log('No valid data found');
        return;
      }
      
      console.log('Setting chart data:', data);
      setChartData(data);
      setDataSource('upload');
      
      // Store only data as JSON
      const chartInfo = {
        title: chartTitle,
        data,
        source: 'upload' as const,
        originalFile: {
          name: file.name,
          type: fileType
        }
      };
      
      onChartUpdate(chartInfo);
      showToast('success', `Berhasil memuat ${data.length} data dari file ${fileType.toUpperCase()}.`);
    } catch (error) {
      console.error('Upload error:', error);
      showToast('error', 'Gagal membaca file. Pastikan format benar.');
    }
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add manual data
  const addManualData = () => {
    const newItem: ChartData = {
      label: `Data ${chartData.length + 1}`,
      value: 0,
      color: chartColor
    };
    
    const newData = [...chartData, newItem];
    setChartData(newData);
    setDataSource('manual');
    onChartUpdate({ title: chartTitle, data: newData, source: 'manual' });
  };

  // Update manual data
  const updateManualData = (index: number, field: 'label' | 'value', value: string | number) => {
    const newData = [...chartData];
    if (field === 'label') {
      newData[index].label = value as string;
    } else {
      newData[index].value = Number(value);
    }
    setChartData(newData);
    onChartUpdate({ title: chartTitle, data: newData, source: 'manual' });
  };

  // Delete data
  const deleteData = (index: number) => {
    const newData = chartData.filter((_, i) => i !== index);
    setChartData(newData);
    onChartUpdate({ title: chartTitle, data: newData, source: dataSource });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
          <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
            {label}
          </p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chartColor }}
            />
            <p className="text-lg font-black dark:text-white">
              {typeof value === 'number' ? value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Download chart as image
  const downloadChartImage = () => {
    if (!chartRef.current) return;
    
    // This would need html2canvas library
    showToast('info', 'Fitur download gambar akan segera tersedia.');
  };

  // Download data as CSV
  const downloadCSV = () => {
    const csvContent = [
      'Label,Value',
      ...chartData.map(item => `"${item.label}",${item.value}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chartTitle.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('success', 'Data berhasil diunduh sebagai CSV.');
  };

  // Copy embed code
  const copyEmbedCode = () => {
    const embedCode = `<iframe src="${window.location.origin}/embed/chart/${btoa(JSON.stringify({ title: chartTitle, data: chartData }))}" width="800" height="400" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    showToast('success', 'Embed code berhasil disalin!');
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <input
            type="text"
            value={chartTitle}
            onChange={(e) => {
              setChartTitle(e.target.value);
              onChartUpdate({ title: e.target.value, data: chartData, source: dataSource });
            }}
            className="text-xl font-black bg-transparent border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-primary outline-none transition-colors dark:text-white"
            placeholder="Judul Chart"
          />
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Download size={16} />
                <span className="text-sm font-medium dark:text-white">Unduh</span>
                <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg z-10">
                  <button
                    onClick={downloadChartImage}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 dark:text-white"
                  >
                    <Download size={16} />
                    Unduh Gambar
                  </button>
                  <button
                    onClick={downloadCSV}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 dark:text-white"
                  >
                    <FileSpreadsheet size={16} />
                    Unduh CSV
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={copyEmbedCode}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Share2 size={16} />
              <span className="text-sm font-medium">Embed</span>
            </button>
          </div>
        </div>

        {/* Chart Display */}
        <div ref={chartRef} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 min-h-100">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                <XAxis 
                  dataKey="label" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }}
                />
                <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill={chartColor} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-87.5 text-center">
              <BarChart3 size={48} className="text-slate-300 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">
                Belum ada data untuk chart
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Data Input Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold dark:text-white">Data Source</h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDataSource('upload')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                dataSource === 'upload' 
                  ? 'bg-primary text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setDataSource('manual')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                dataSource === 'manual' 
                  ? 'bg-primary text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Input Manual
            </button>
          </div>
        </div>

        {dataSource === 'upload' ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all group">
              <Upload size={48} className="text-slate-400 mx-auto mb-4 group-hover:text-primary transition-colors" />
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-2 group-hover:text-primary transition-colors">
                Klik untuk upload CSV atau Excel file
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
                Format: label,value atau label;value (contoh: "Januari,100" atau "Januari;100")
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                  <FileSpreadsheet size={12} />
                  <span>CSV</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileSpreadsheet size={12} />
                  <span>XLSX</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileSpreadsheet size={12} />
                  <span>XLS</span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
              >
                Pilih File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFileUpload(e);
                }}
                className="hidden"
              />
            </div>
            
            {chartData.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    File berhasil diupload!
                  </p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {chartData.length} data item berhasil diproses
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Input data secara manual
              </p>
              <button
                onClick={addManualData}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus size={14} />
                Tambah Data
              </button>
            </div>
            
            {chartData.length > 0 && (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {chartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateManualData(index, 'label', e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                      placeholder="Label"
                    />
                    <input
                      type="number"
                      value={item.value}
                      onChange={(e) => updateManualData(index, 'value', e.target.value)}
                      className="w-24 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => deleteData(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartEditor;
