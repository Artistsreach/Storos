let
  # Import nixpkgs. You can pin this to a specific commit or channel for more reproducibility.
  # Using the 24.05 stable channel as specified.
  nixpkgs_src = builtins.fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/nixos-24.05.tar.gz";
    # You can add a sha256 hash here for security and to ensure integrity,
    # but nix-shell will also cache it based on the URL.
  };
  pkgs = import nixpkgs_src { config = {}; overlays = []; };
in
pkgs.mkShell {
  # Packages to make available in the shell
  buildInputs = [
    pkgs.git-filter-repo
    # You can add other packages here, e.g.:
    # pkgs.nodejs
  ];

  # You can set environment variables here if needed
  # shellHook = ''
  #   export MY_VARIABLE="hello"
  # '';
}
