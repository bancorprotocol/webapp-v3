export const ButtonSamples = () => {
  return (
    <div className="space-y-10">
      <h1>Buttons</h1>
      <div className="grid grid-cols-4 gap-10">
        <div className="mx-auto">
          <button className="btn-primary">Btn Primary</button>
        </div>

        <div className="mx-auto">
          <button className="btn-info">Btn Info</button>
        </div>

        <div className="mx-auto">
          <button className="btn-warning">Btn Warning</button>
        </div>

        <div className="mx-auto">
          <button className="btn-error">Btn Error</button>
        </div>
      </div>

      <h1>Outline Buttons</h1>
      <div className="grid grid-cols-4 gap-10">
        <div className="mx-auto">
          <button className="btn-outline-primary">Btn Outline Primary</button>
        </div>

        <div className="mx-auto">
          <button className="btn-outline-info">Btn Outline Info</button>
        </div>

        <div className="mx-auto">
          <button className="btn-outline-warning">Btn Outline Warning</button>
        </div>

        <div className="mx-auto">
          <button className="btn-outline-error">Btn Outline Error</button>
        </div>
      </div>

      <h1>Buttons</h1>
      <div className="grid grid-cols-5 gap-10">
        <div className="mx-auto">
          <button className="btn-primary btn-xs">Btn Extra Small</button>
        </div>

        <div className="mx-auto">
          <button className="btn-info btn-sm">Btn Small</button>
        </div>

        <div className="mx-auto">
          <button className="btn-warning">Btn Regular</button>
        </div>

        <div className="mx-auto">
          <button className="btn-error btn-lg">Btn Large</button>
        </div>

        <div className="mx-auto">
          <button className="btn-error btn-xl">Btn Extra Large</button>
        </div>
      </div>

      <h1>Buttons Semi Round</h1>
      <div className="grid grid-cols-5 gap-10">
        <div className="mx-auto">
          <button className="btn-primary btn-xs rounded">
            Btn Extra Small
          </button>
        </div>

        <div className="mx-auto">
          <button className="btn-info btn-sm rounded">Btn Small</button>
        </div>

        <div className="mx-auto">
          <button className="btn-warning rounded">Btn Regular</button>
        </div>

        <div className="mx-auto">
          <button className="btn-error btn-lg rounded">Btn Large</button>
        </div>

        <div className="mx-auto">
          <button className="btn-error btn-xl rounded">Btn Extra Large</button>
        </div>
      </div>
    </div>
  );
};
