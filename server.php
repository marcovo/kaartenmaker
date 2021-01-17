<?php

class Server
{
    private ?PDO $pdo = null;
    private ?array $config = null;

    public static function handle()
    {
        $instance = new self();

        switch($_GET['request'] ?? null) {
            case 'participation':
                $instance->participation();
                break;
            case 'cutout_download':
                $instance->cutout_download();
                break;
            case 'js_error':
                $instance->js_error();
                break;
            default:
                throw new \Exception('Invalid request');
        }

        $instance->pdo = null;
    }

    private function getConfig(): array
    {
        if($this->config === null) {
            $this->config = json_decode(file_get_contents('./server-config/config.json'), true);
        }

        return $this->config;
    }

    private function getPdo(): PDO
    {
        if($this->pdo === null) {
            $config = $this->getConfig();

            $this->pdo = new PDO(
                'mysql:host='.$config['MYSQL_HOST'].';dbname='.$config['MYSQL_DATABASE'].';charset=utf8mb4',
                $config['MYSQL_USER'],
                $config['MYSQL_PASSWORD'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ],
            );
        }

        return $this->pdo;
    }

    private function checkThrottle(string $table)
    {
        $config = $this->getConfig();

        if($config['THROTTLE_SECONDS'] <= 0 || $config['THROTTLE_COUNT'] <= 0) {
            return;
        }

        $pdo = $this->getPdo();

        $threshold = (new \DateTime('now'))
            ->sub(new \DateInterval('PT'.$config['THROTTLE_SECONDS'].'S'))
            ->format('Y-m-d H:i:s');

        $stmt = $pdo->prepare('SELECT COUNT(*) AS num FROM ' . $table . ' WHERE created_at >= ?');
        $stmt->execute([$threshold]);
        $row = $stmt->fetch();

        if($row['num'] >= $config['THROTTLE_COUNT']) {
            throw new \Exception('Throttle limit');
        }
    }

    private function participation()
    {
        if(!in_array($_POST['choice'] ?? null, ['0', '1'], true)) {
            throw new \Exception('Invalid choice');
        }

        $config = $this->getConfig();
        if(!$config['STATS_ENABLED']) {
            return;
        }

        $this->checkThrottle('participation');

        $pdo = $this->getPdo();
        $stmt = $pdo->prepare('INSERT INTO participation(choice, created_at) VALUES (?, NOW())');
        $stmt->execute([($_POST['choice'] === '1') ? 'YES' : 'NO']);
    }

    private function cutout_download()
    {
        if(empty($_POST['settings'])) {
            throw new \Exception('Empty settings');
        }

        $config = $this->getConfig();
        if(!$config['STATS_ENABLED']) {
            return;
        }

        $this->checkThrottle('cutout_download');

        $pdo = $this->getPdo();
        $stmt = $pdo->prepare('INSERT INTO cutout_download(settings, created_at) VALUES (?, NOW())');
        $stmt->execute([$_POST['settings']]);
    }

    private function js_error()
    {
        if(empty($_POST['message'])) {
            throw new \Exception('Empty message');
        }

        $this->checkThrottle('js_error');

        $pdo = $this->getPdo();
        $stmt = $pdo->prepare('INSERT INTO js_error(message, created_at) VALUES (?, NOW())');
        $stmt->execute([$_POST['message']]);
    }
}

try {
    Server::handle();
    echo('1');
} catch(\Throwable $e) {
    echo('0');
}
