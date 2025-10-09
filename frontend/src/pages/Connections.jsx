import ConnectServices from '../components/Auth/ConnectServices';

function Connections({ userId, connectedServices, onUpdate }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mes connexions
        </h1>
        <p className="text-gray-600">
          Gérez vos services cloud connectés
        </p>
      </div>

      <ConnectServices
        userId={userId}
        connectedServices={connectedServices}
        onUpdate={onUpdate}
      />
    </div>
  );
}

export default Connections;