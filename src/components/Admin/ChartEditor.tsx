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
  const [chartTitle, setChartTitle] = useState('Performance Statistics');
  const [chartSource, setChartSource] = useState('Internal Data');
  const [xAxisTitle, setXAxisTitle] = useState('Year');
  const [yAxisTitle, setYAxisTitle] = useState('Inflation');
  const [dataSource, setDataSource] = useState<'upload' | 'manual'>('manual');
  const [chartLayout, setChartLayout] = useState<'horizontal' | 'vertical' | 'auto'>(initialLayout || 'auto');
  const [chartType, setChartType] = useState<'bar' | 'line'>(initialType || 'bar');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const chartColor = '#0d2137';

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

  const parseCSV = (text: string): ChartData[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const data: ChartData[] = [];
    
    lines.forEach((line, index) => {
      if (index === 0 && (line.toLowerCase().includes('label') || line.toLowerCase().includes('value') || line.toLowerCase().includes('name'))) {
        return;
      }
      
      const separator = line.includes(';') ? ';' : ',';
      let parts = line.split(separator);
      
      if (separator === ',' && parts.length > 2) {
        parts = [parts[0], parts.slice(1).join(',')];
      }

      if (parts.length >= 2) {
        const label = parts[0].trim().replace(/["']/g, '');
        let valueStr = parts[1].trim().replace(/["']/g, '');
        
        if (valueStr.includes(',') && valueStr.includes('.')) {
          valueStr = valueStr.replace(/,/g, '');
        } else if (valueStr.includes(',')) {
          valueStr = valueStr.replace(',', '.');
        }
        
        const value = parseFloat(valueStr);
        
        if (label && !isNaN(value) && value !== null) {
          data.push({
            label,
            value,
            color: chartColor
          });
        }
      }
    });
    
    return data;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(fileType)) {
      showToast('error', 'Unsupported file format. Please upload CSV or Excel.');
      return;
    }

    try {
      let data: ChartData[] = [];
      
      if (fileType === 'csv') {
        const text = await file.text();
        data = parseCSV(text);
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        data = jsonData
          .slice(1)
          .filter((row: any) => row.length >= 2 && row[0] && row[1])
          .map((row: any) => {
            const label = String(row[0]).trim();
            let valueStr = String(row[1]).trim();
            
            if (valueStr.includes(',') && valueStr.includes('.')) {
              valueStr = valueStr.replace(/,/g, '');
            } else if (valueStr.includes(',')) {
              valueStr = valueStr.replace(',', '.');
            }
            
            const value = parseFloat(valueStr);
            
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
        showToast('warning', 'No valid data found in file. Check your file format.');
        return;
      }
      
      setChartData(data);
      setDataSource('upload');
      
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
      showToast('success', `Successfully loaded ${data.length} data rows from ${fileType.toUpperCase()} file.`);
    } catch (error) {
      console.error('Upload error:', error);
      showToast('error', 'Failed to read file. Make sure the format is correct.');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addManualData = () => {
    const newItem: ChartData = {
      label: `Item ${chartData.length + 1}`,
      value: 0,
      color: chartColor
    };
    
    const newData = [...chartData, newItem];
    setChartData(newData);
    setDataSource('manual');
    onChartUpdate({ title: chartTitle, sourceText: chartSource, xAxisTitle, yAxisTitle, data: newData, chartLayout, chartType, source: 'manual' });
  };

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

  const deleteData = (index: number) => {
    const newData = chartData.filter((_, i) => i !== index);
    setChartData(newData);
    onChartUpdate({ title: chartTitle, sourceText: chartSource, xAxisTitle, yAxisTitle, data: newData, chartLayout, chartType, source: dataSource });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      
      return (
        <div className="bg-white p-4 border border-slate-200 shadow-md rounded-none font-sans">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            {label}
          </p>
          <div className="flex items-center gap-2 font-sans">
            <div 
              className="w-2.5 h-2.5 rounded-none"
              style={{ backgroundColor: chartColor }}
            />
            <p className="text-base font-bold text-slate-900">
              {typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : value}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const downloadChartImage = () => {
    if (!chartRef.current) return;
    showToast('info', 'Image download feature will be available soon.');
  };

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
    
    showToast('success', 'Data successfully downloaded as CSV.');
  };

  const copyEmbedCode = () => {
    const embedCode = `<iframe src="${window.location.origin}/embed/chart/${btoa(JSON.stringify({ title: chartTitle, data: chartData }))}" width="800" height="400" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    showToast('success', 'Embed code successfully copied!');
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      <div className="bg-white rounded-none border border-slate-200 p-6 font-sans shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 font-sans">
          <div className="flex flex-col space-y-4 w-full max-w-md font-sans">
            <div className="font-sans">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Chart Title Preview</label>
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => {
                  setChartTitle(e.target.value);
                  onChartUpdate({ title: e.target.value, sourceText: chartSource, data: chartData, source: dataSource });
                }}
                className="w-full text-lg font-serif font-bold bg-transparent border-b border-slate-200 hover:border-slate-400 focus:border-[#0d2137] focus:outline-none transition-colors text-slate-900 pb-1.5"
                placeholder="Chart Title"
              />
            </div>
            <div className="font-sans">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Data Source (Displayed below chart)</label>
              <input
                type="text"
                value={chartSource}
                onChange={(e) => {
                  setChartSource(e.target.value);
                  onChartUpdate({ title: chartTitle, sourceText: e.target.value, xAxisTitle, yAxisTitle, data: chartData, source: dataSource });
                }}
                className="w-full text-xs font-medium bg-transparent border-b border-slate-200 hover:border-slate-400 focus:border-[#0d2137] focus:outline-none transition-colors text-slate-600 pb-1.5"
                placeholder="Example: BPS RI, 2026"
              />
            </div>
            <div className="flex gap-4 font-sans">
              <div className="flex-1 font-sans">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">X-Axis Label</label>
                <input
                  type="text"
                  value={xAxisTitle}
                  onChange={(e) => {
                    setXAxisTitle(e.target.value);
                    onChartUpdate({ title: chartTitle, sourceText: chartSource, xAxisTitle: e.target.value, yAxisTitle, data: chartData, source: dataSource });
                  }}
                  className="w-full text-xs font-bold bg-transparent border-b border-slate-200 focus:border-[#0d2137] focus:outline-none transition-colors text-slate-900 pb-1.5"
                  placeholder="Example: Year"
                />
              </div>
              <div className="flex-1 font-sans">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Y-Axis Label</label>
                <input
                  type="text"
                  value={yAxisTitle}
                  onChange={(e) => {
                    setYAxisTitle(e.target.value);
                    onChartUpdate({ title: chartTitle, sourceText: chartSource, xAxisTitle, yAxisTitle: e.target.value, data: chartData, source: dataSource });
                  }}
                  className="w-full text-xs font-bold bg-transparent border-b border-slate-200 focus:border-[#0d2137] focus:outline-none transition-colors text-slate-900 pb-1.5"
                  placeholder="Example: Inflation (%)"
                />
              </div>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-none border border-slate-200 w-fit mt-2 font-sans">
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
                   className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${chartType === opt.id ? 'bg-[#0d2137] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                 >
                   {opt.icon} {opt.label}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 font-sans">
            <div className="flex bg-slate-100 p-1 rounded-none border border-slate-200 font-sans">
               {[
                 { id: 'vertical', label: 'Vertical', icon: <BarChart3 size={14} className="rotate-0" /> },
                 { id: 'horizontal', label: 'Horizontal', icon: <BarChart3 size={14} className="rotate-90" /> },
                 { id: 'auto', label: 'Auto', icon: <Settings size={14} /> }
               ].map((opt) => (
                 <button
                   key={opt.id}
                   type="button"
                   onClick={() => {
                     setChartLayout(opt.id as any);
                     onChartUpdate({ title: chartTitle, sourceText: chartSource, xAxisTitle, yAxisTitle, data: chartData, chartLayout: opt.id, source: dataSource });
                   }}
                   className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${chartLayout === opt.id ? 'bg-[#0d2137] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                 >
                   {opt.icon} {opt.label}
                 </button>
               ))}
            </div>

            <div className="relative font-sans">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors rounded-none"
              >
                <Download size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Download</span>
                <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 shadow-lg z-20 font-sans">
                  <button
                    type="button"
                    onClick={downloadChartImage}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <Download size={14} />
                    Download Image
                  </button>
                  <button
                    type="button"
                    onClick={downloadCSV}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 border-t border-slate-100"
                  >
                    <FileSpreadsheet size={14} />
                    Download CSV
                  </button>
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={copyEmbedCode}
              className="flex items-center gap-2 px-4 py-2 bg-[#0d2137] text-white hover:bg-slate-900 border border-[#0d2137] transition-colors rounded-none shadow-sm"
            >
              <Share2 size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Embed</span>
            </button>
          </div>
        </div>

        <div ref={chartRef} className="bg-slate-50 border border-slate-200 p-6 rounded-none min-h-[350px] relative font-sans">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={isHorizontal} horizontal={!isHorizontal} stroke="#CBD5E1" opacity={0.6} />
                  
                  {isHorizontal ? (
                    <>
                      <XAxis type="number" height={40} tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}>
                         {yAxisTitle && (
                           <Label value={yAxisTitle} offset={-15} position="insideBottom" fill="#64748B" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} />
                         )}
                      </XAxis>
                      <YAxis 
                        type="category" 
                        dataKey="label" 
                        width={90}
                        tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                        axisLine={{ stroke: '#CBD5E1' }}
                        tickLine={false}
                      >
                         {xAxisTitle && (
                           <Label value={xAxisTitle} angle={-90} position="insideLeft" offset={-25} style={{ textAnchor: 'middle', fill: '#64748B', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} />
                         )}
                      </YAxis>
                    </>
                  ) : (
                    <>
                      <XAxis 
                        dataKey="label" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }}
                      >
                        {xAxisTitle && (
                          <Label value={xAxisTitle} offset={-30} position="insideBottom" fill="#64748B" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} />
                        )}
                      </XAxis>
                      <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }}>
                        {yAxisTitle && (
                          <Label value={yAxisTitle} angle={-90} position="insideLeft" offset={0} style={{ textAnchor: 'middle', fill: '#64748B', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} />
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
                      dot={{ r: 5, fill: chartColor, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7, strokeWidth: 0 }}
                      type="monotone"
                    >
                      <LabelList 
                        dataKey="value" 
                        position={isHorizontal ? "right" : "top"} 
                        fill="#475569" 
                        fontSize={11} 
                        fontWeight={700} 
                        offset={isHorizontal ? 10 : 12} 
                      />
                    </Line>
                  ) : (
                    <Bar 
                      dataKey="value" 
                      fill={chartColor}
                      barSize={isHorizontal ? 20 : 35}
                    >
                      <LabelList 
                        dataKey="value" 
                        position={isHorizontal ? "right" : "top"} 
                        fill="#475569" 
                        fontSize={11} 
                        fontWeight={700} 
                        offset={isHorizontal ? 10 : 12} 
                      />
                    </Bar>
                  )}
                </ChartComponent>
              </ResponsiveContainer>
            );
          })() : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center font-sans">
              <BarChart3 size={40} className="text-slate-400 mb-3" />
              <p className="text-slate-500 font-medium text-sm">
                No data available for chart
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-none border border-slate-200 p-6 font-sans shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 font-sans">
          <h3 className="text-base font-serif font-bold text-slate-900 uppercase">Data Labels & Values</h3>
          
          <div className="flex flex-wrap items-center gap-3 font-sans">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-[#0d2137] text-white rounded-none font-bold text-xs uppercase tracking-wider transition-colors hover:bg-slate-900 border border-[#0d2137] shadow-sm"
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
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-none font-bold text-xs uppercase tracking-wider transition-colors border border-slate-200"
            >
              <Plus size={16} />
              Manual Input
            </button>
          </div>
        </div>

        <div className="space-y-3 font-sans">
          {chartData.length > 0 ? (
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2 font-sans">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-none font-sans">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateManualData(index, 'label', e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-none text-xs focus:outline-none focus:border-[#0d2137] text-slate-900 font-medium transition-colors"
                    placeholder="Label Name..."
                  />
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => updateManualData(index, 'value', e.target.value)}
                    className="w-32 px-3.5 py-2 bg-white border border-slate-200 rounded-none text-xs focus:outline-none focus:border-[#0d2137] text-slate-900 font-mono transition-colors"
                    placeholder="Value"
                  />
                  <button
                    type="button"
                    onClick={() => deleteData(index)}
                    className="p-2 text-slate-400 hover:text-[#c0392b] hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-none transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-slate-300 bg-slate-50 rounded-none font-sans">
              <p className="text-slate-500 font-medium text-xs">Click "Upload CSV/Excel" or "Manual Input" to start adding data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartEditor;
