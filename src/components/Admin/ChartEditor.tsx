import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, Legend, Label, LabelList, LineChart, Line 
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
  initialLayout?: 'horizontal' | 'vertical' | 'auto';
  initialType?: 'bar' | 'line';
}

const ChartEditor: React.FC<ChartEditorProps> = ({ onChartUpdate, initialData = [], initialLayout = 'auto', initialType = 'bar' }) => {
  const [chartData, setChartData] = useState<ChartData[]>(initialData);
  const [chartTitle, setChartTitle] = useState('Statistik Performa');
  const [chartSource, setChartSource] = useState('Data Internal');
    const [xAxisTitle, setXAxisTitle] = useState('Tahun');
  const [yAxisTitle, setYAxisTitle] = useState('Inflasi');
  const [dataSource, setDataSource] = useState<'upload' | 'manual'>('manual');
  const [chartLayout, setChartLayout] = useState<'horizontal' | 'vertical' | 'auto'>(initialLayout || 'auto');
  const [chartType, setChartType] = useState<'bar' | 'line'>(initialType || 'bar');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Single color for all bars
  const chartColor = '#8b5cf6';

  // Central sync effect to ensure all settings are saved
  useEffect(() => {
    onChartUpdate({
      title: chartTitle,
      sourceText: chartSource,
      xAxisTitle,
      yAxisTitle,
      data: chartData,
      chartLayout,
      chartType,
      source: dataSource
    });
  }, [chartData, chartTitle, chartSource, chartLayout, chartType, xAxisTitle, yAxisTitle, dataSource]);

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
      let parts = line.split(separator);
      
      // If we used comma as separator and got > 2 parts, it's possible the value itself contains a fractional comma (e.g., Label,12,34 or "Label","12,34")
      if (separator === ',' && parts.length > 2) {
        parts = [parts[0], parts.slice(1).join(',')];
      }

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
      setChartData(data);
      setDataSource('upload');
      
      // Store only data as JSON
      const chartInfo = {
        title: chartTitle,
        sourceText: chartSource,
        xAxisTitle,
        yAxisTitle,
        data,
        chartLayout,
        chartType,
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
    onChartUpdate({ title: chartTitle, sourceText: chartSource, xAxisTitle, yAxisTitle, data: newData, chartLayout, chartType, source: 'manual' });
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
    onChartUpdate({ title: chartTitle, sourceText: chartSource, xAxisTitle, yAxisTitle, data: newData, chartLayout, chartType, source: 'manual' });
  };

  // Delete data
  const deleteData = (index: number) => {
    const newData = chartData.filter((_, i) => i !== index);
    setChartData(newData);
    onChartUpdate({ title: chartTitle, sourceText: chartSource, xAxisTitle, yAxisTitle, data: newData, chartLayout, chartType, source: dataSource });
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex flex-col space-y-4 w-full max-w-md">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Judul Chart Preview</label>
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => {
                  setChartTitle(e.target.value);
                  onChartUpdate({ title: e.target.value, sourceText: chartSource, data: chartData, source: dataSource });
                }}
                className="w-full text-xl font-black bg-transparent border-b-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 focus:border-primary outline-none transition-colors dark:text-white pb-1"
                placeholder="Judul Chart"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Sumber Data (Tampil di Bawah Chart)</label>
              <input
                type="text"
                value={chartSource}
                onChange={(e) => {
                  setChartSource(e.target.value);
                  onChartUpdate({ title: chartTitle, sourceText: e.target.value, xAxisTitle, yAxisTitle, data: chartData, source: dataSource });
                }}
                className="w-full text-sm font-medium bg-transparent border-b-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 focus:border-primary outline-none transition-colors text-slate-500 pb-1"
                placeholder="Contoh: BPS RI, 2026"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Label Sumbu X</label>
                <input
                  type="text"
                  value={xAxisTitle}
                  onChange={(e) => {
                    setXAxisTitle(e.target.value);
                    onChartUpdate({ title: chartTitle, sourceText: chartSource, xAxisTitle: e.target.value, yAxisTitle, data: chartData, source: dataSource });
                  }}
                  className="w-full text-xs font-bold bg-transparent border-b border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition-colors dark:text-white pb-1"
                  placeholder="Contoh: Tahun"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Label Sumbu Y</label>
                <input
                  type="text"
                  value={yAxisTitle}
                  onChange={(e) => {
                    setYAxisTitle(e.target.value);
                    onChartUpdate({ title: chartTitle, sourceText: chartSource, xAxisTitle, yAxisTitle: e.target.value, data: chartData, source: dataSource });
                  }}
                  className="w-full text-xs font-bold bg-transparent border-b border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition-colors dark:text-white pb-1"
                  placeholder="Contoh: Inflasi (%)"
                />
              </div>
            </div>
            
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit mt-2">
               {[
                 { id: 'bar', label: 'Bar Chart', icon: <BarChart3 size={14} /> },
                 { id: 'line', label: 'Line Chart', icon: <Share2 size={14} className="rotate-90" /> }
               ].map((opt) => (
                 <button
                   key={opt.id}
                   type="button"
                   onClick={() => {
                     setChartType(opt.id as any);
                     onChartUpdate({ title: chartTitle, sourceText: chartSource, xAxisTitle, yAxisTitle, data: chartData, chartLayout, chartType: opt.id, source: dataSource });
                   }}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartType === opt.id ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                 >
                   {opt.icon} {opt.label}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
               {[
                 { id: 'vertical', label: 'Tegak', icon: <BarChart3 size={14} className="rotate-0" /> },
                 { id: 'horizontal', label: 'Miring', icon: <BarChart3 size={14} className="rotate-90" /> },
                 { id: 'auto', label: 'Auto', icon: <Settings size={14} /> }
               ].map((opt) => (
                 <button
                   key={opt.id}
                   type="button"
                   onClick={() => {
                     setChartLayout(opt.id as any);
                     onChartUpdate({ title: chartTitle, sourceText: chartSource, xAxisTitle, yAxisTitle, data: chartData, chartLayout: opt.id, source: dataSource });
                   }}
                   className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartLayout === opt.id ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                 >
                   {opt.icon} {opt.label}
                 </button>
               ))}
            </div>

            <div className="relative">
              <button
                type="button"
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
                    type="button"
                    onClick={downloadChartImage}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 dark:text-white"
                  >
                    <Download size={16} />
                    Unduh Gambar
                  </button>
                  <button
                    type="button"
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
              type="button"
              onClick={copyEmbedCode}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Share2 size={16} />
              <span className="text-sm font-medium">Embed</span>
            </button>
          </div>
        </div>

        {/* Chart Display */}
        <div ref={chartRef} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 min-h-100 relative">
          {chartData.length > 0 ? (() => {
            const isHorizontal = chartType === 'bar' && (chartLayout === 'horizontal' || (chartLayout === 'auto' && (chartData.length > 10 || window.innerWidth < 768)));
            const ChartComponent = chartType === 'line' ? LineChart : BarChart;
            const DataComponent = chartType === 'line' ? Line : Bar;

            return (
              <ResponsiveContainer width="100%" height={350}>
                <ChartComponent 
                  data={chartData} 
                  layout={isHorizontal ? 'vertical' : 'horizontal'}
                  margin={{ 
                    top: 30, 
                    right: isHorizontal ? 60 : 30, 
                    left: isHorizontal ? 40 : (yAxisTitle ? 30 : 10), 
                    bottom: isHorizontal ? 40 : 60 
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={isHorizontal} horizontal={!isHorizontal} stroke="#E2E8F0" opacity={0.3} />
                  
                  {isHorizontal ? (
                    <>
                      <XAxis type="number" height={40} tick={{ fontSize: 10, fill: '#64748B' }}>
                         {yAxisTitle && (
                           <Label value={yAxisTitle} offset={-15} position="insideBottom" fill="#94A3B8" style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                         )}
                      </XAxis>
                      <YAxis 
                        type="category" 
                        dataKey="label" 
                        width={90}
                        tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }}
                        axisLine={{ stroke: '#E2E8F0' }}
                        tickLine={false}
                      >
                         {xAxisTitle && (
                           <Label value={xAxisTitle} angle={-90} position="insideLeft" offset={-25} style={{ textAnchor: 'middle', fill: '#94A3B8', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                         )}
                      </YAxis>
                    </>
                  ) : (
                    <>
                      <XAxis 
                        dataKey="label" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }}
                      >
                        {xAxisTitle && (
                          <Label value={xAxisTitle} offset={-40} position="insideBottom" fill="#94A3B8" style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                        )}
                      </XAxis>
                      <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }}>
                        {yAxisTitle && (
                          <Label value={yAxisTitle} angle={-90} position="insideLeft" offset={0} style={{ textAnchor: 'middle', fill: '#94A3B8', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                        )}
                      </YAxis>
                    </>
                  )}

                  <Tooltip content={<CustomTooltip />} />
                  {chartType === 'line' ? (
                    <Line 
                      dataKey="value" 
                      stroke={chartColor}
                      strokeWidth={3}
                      dot={{ r: 6, fill: chartColor, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                      type="monotone"
                    >
                      <LabelList 
                        dataKey="value" 
                        position={isHorizontal ? "right" : "top"} 
                        fill="#64748B" 
                        fontSize={10} 
                        fontWeight={900} 
                        offset={isHorizontal ? 10 : 12} 
                      />
                    </Line>
                  ) : (
                    <Bar 
                      dataKey="value" 
                      fill={chartColor}
                      radius={isHorizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]}
                      barSize={isHorizontal ? 20 : 35}
                    >
                      <LabelList 
                        dataKey="value" 
                        position={isHorizontal ? "right" : "top"} 
                        fill="#64748B" 
                        fontSize={10} 
                        fontWeight={900} 
                        offset={isHorizontal ? 10 : 12} 
                      />
                    </Bar>
                  )}
                </ChartComponent>
              </ResponsiveContainer>
            );
          })() : (
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-bold dark:text-white">Data Label & Value</h3>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium transition-colors hover:bg-primary/90"
            >
              <FileSpreadsheet size={16} />
              Upload CSV/Excel
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={addManualData}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-medium transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Plus size={16} />
              Input Manual
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {chartData.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateManualData(index, 'label', e.target.value)}
                    className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-medium"
                    placeholder="Nama Label..."
                  />
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => updateManualData(index, 'value', e.target.value)}
                    className="w-32 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-mono"
                    placeholder="Nilai Data"
                  />
                  <button
                    type="button"
                    onClick={() => deleteData(index)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-slate-500 dark:text-slate-400 font-medium">Klik "Upload CSV/Excel" atau "Input Manual" untuk mulai menambah data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartEditor;
