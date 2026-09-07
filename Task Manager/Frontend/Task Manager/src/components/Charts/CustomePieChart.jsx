import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import CustomeTooltip from './CustomeTooltip'
import CustomeLegend from './CustomeLegend'

const CustomePieChart = ({data, color}) => {
  const hasData = data?.some((entry) => Number(entry.count) > 0);

  if (!hasData) {
    return (
      <div className="flex h-[325px] items-center justify-center text-sm text-slate-400">
        No task data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={325}>
        <PieChart>
            <Pie 
            data={data} 
            dataKey='count' 
            nameKey='status' 
            cx='50%' 
            cy='50%' 
            outerRadius={130} 
            innerRadius={100} 
            labelLine={false}
            >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={color[index % color.length]}/>
                ))}
            </Pie>
            <Tooltip content={<CustomeTooltip/>}/>
            <Legend content={<CustomeLegend/>}/>
        </PieChart>
    </ResponsiveContainer>
  )
}

export default CustomePieChart
