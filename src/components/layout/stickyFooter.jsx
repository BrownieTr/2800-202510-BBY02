export default function StickyFooter({ iconLeft, iconRight, iconMiddle }) {
  return (
    <footer className="sticky bottom-0 z-50 bg-white w-full">
      <div className="container mx-auto flex justify-around items-center">
        <div className="p-2">{iconLeft}</div>
        <div className="p-2">{iconMiddle}</div>
        <div className="p-2">{iconRight}</div>
      </div>
    </footer>
  );
}
