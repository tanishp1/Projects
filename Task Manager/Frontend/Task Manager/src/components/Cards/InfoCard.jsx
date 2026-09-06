const InfoCard = ({label, value, color}) => {
  return (
    <div className='flex min-w-0 items-center gap-2'>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
      <p className='min-w-0 truncate text-xs text-gray-500 md:text-sm'>
        <span className='mr-1 font-semibold text-gray-900'>{value}</span>
        {label}
      </p>
    </div>
  )
}

export default InfoCard;
