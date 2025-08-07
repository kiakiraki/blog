/** @jsxImportSource react */

export const OgImageTemplate = ({
  title,
  description,
  category,
  type,
}: {
  title: string;
  description?: string;
  category?: string;
  type: string;
}) => {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #0ea5e9, #0284c7)',
        color: '#1f2937',
        fontFamily: '"Noto Sans JP"',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '1100px',
          height: '530px',
          padding: '50px',
          borderRadius: '24px',
          backgroundColor: 'rgba(255,255,255,0.98)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              padding: '8px 24px',
              borderRadius: '9999px',
              backgroundColor: '#0ea5e9',
              color: 'white',
              fontSize: '24px',
              fontWeight: 600,
            }}
          >
            {type}
          </div>
          {category && (
            <div
              style={{
                display: 'flex',
                padding: '8px 24px',
                borderRadius: '9999px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                fontSize: '22px',
                fontWeight: 500,
              }}
            >
              {category}
            </div>
          )}
        </div>

        <div
          style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              fontSize: title.length > 35 ? '52px' : '64px',
              fontWeight: 800,
              lineHeight: 1.2,
              textAlign: 'center',
              padding: '0 20px',
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                fontSize: '32px',
                marginTop: '24px',
                color: '#4b5563',
                textAlign: 'center',
                padding: '0 40px',
              }}
            >
              {description}
            </p>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            fontSize: '28px',
            fontWeight: 600,
            color: '#0ea5e9',
          }}
        >
          趣味の記録
        </div>
      </div>
    </div>
  );
};
