import { Card } from '@nextui-org/react';
import Image from 'next/image';
import NextLink from 'next/link';

interface IProps {
  topic?: string;
  logo?: string;
  name?: string;
  username?: string;
  url?: string;
  contractAddress?: string;
}

const TraderCard: React.FC<IProps> = ({
  logo,
  name,
  username,
  topic,
  contractAddress
}) => {
  return (
    <NextLink
      href={name ?
        `/trader?name=${name}&logo=${logo}&username=${username}&contractAddress=${contractAddress}`
        : '#'
      }
      passHref
    >
      <Card
        isHoverable
        isPressable
        style={{
          cursor: 'pointer',
          marginBottom: '16px',
          backgroundColor: '#1E1E1E',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          width: '460px'
        }}
        data-testid={`session-card`}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Profile Image - changed from Avatar to Image */}
          <div style={{ position: 'relative', width: '48px', height: '48px' }}>
            <Image
              src={logo || '/icons/avatar.svg'}
              className="rounded-full"
              alt={name || "Trader profile"}
              width={48}
              height={48}
              style={{
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          </div>

          {/* Name, Username, and Arrow Icon */}
          <div style={{ flex: 1, marginLeft: '16px', color: '#FFF', display: 'flex', alignItems: 'center' }}>
            <div style={{ flexGrow: 1 }}>
              <h5 style={{ margin: 0, fontWeight: '500', color: '#FFFFFF' }} data-testid={`session-text`}>
                {name}
              </h5>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#999' }}>
                @{username}
              </p>
            </div>

            {/* Arrow Icon (next to text) */}
            <div style={{ marginLeft: '260px', justifyItems: "flex-end" }}>
              <Image
                src={'/icons/arrow-right-icon.svg'}
                width={20}
                height={20}
                alt="session icon"
                data-testid={`session-icon`}
              />
            </div>
          </div>
        </div>
      </Card>
    </NextLink>
  );
};

export default TraderCard;