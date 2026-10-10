export default function Marca({ className = '' }: { className?: string }) {
  return (
    <span className={`font-marca text-2xl font-bold tracking-tight text-lima ${className}`}>
      ZANFIT
    </span>
  )
}
